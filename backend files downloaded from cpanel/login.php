<?php
// Start output buffering immediately to capture any unintended output
ob_start();

// Disable HTML error displays so warnings/notices don't corrupt JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");

try {
    require_once __DIR__ . '/../config.php';

    // --------------------------------------------------
    // BLOCKED IP CHECK (MUST BE FIRST)
    // --------------------------------------------------
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    $stmt = $pdo->prepare("SELECT id FROM blocked_ips WHERE ip = ?");
    $stmt->execute([$ip]);

    if ($stmt->fetch()) {
        ob_clean();
        echo json_encode(["error" => "Access denied"]);
        exit;
    }

    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------
    require_once __DIR__ . '/../../helpers/validation.php';
    require_once __DIR__ . '/../../helpers/security.php';
    require_once __DIR__ . '/../../helpers/send_otp.php';
    require_once __DIR__ . '/../../helpers/rate_limiter.php';
    require_once __DIR__ . '/../../helpers/audit.php';
    require_once __DIR__ . '/../../helpers/alerts.php';
    require_once __DIR__ . '/../../helpers/risk.php';
    require_once __DIR__ . '/../../helpers/risk_actions.php';

    // --------------------------------------------------
    // RATE LIMIT
    // --------------------------------------------------
    $key = 'login_' . $ip;
    checkRateLimit($pdo, $key, 5, 60);

    // --------------------------------------------------
    // INPUT (Strip hidden non-breaking spaces)
    // --------------------------------------------------
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);

    $email = isset($data["email"]) ? trim(str_replace("\xc2\xa0", "", $data["email"])) : "";
    $password = isset($data["password"]) ? trim($data["password"]) : "";

    if (empty($email) || empty($password)) {
        ob_clean();
        echo json_encode(["error" => "All fields required"]);
        exit;
    }

    // --------------------------------------------------
    // FETCH USER
    // --------------------------------------------------
    $stmt = $pdo->prepare("SELECT id, email, password, is_verified FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // --------------------------------------------------
    // BASIC AUTH FAILURE
    // --------------------------------------------------
    if (!$user || !password_verify($password, $user["password"])) {

        auditLog(
            $pdo,
            'login_failed',
            $user['id'] ?? null,
            $ip, 
            null,
            ['email' => $email]
        );

        createAlert(
            $pdo,
            'login_attack',
            'medium',
            'Multiple failed login attempts',
            ['email' => $email, 'ip' => $ip]
        );

        // Check recent failed attempts from this IP
        $stmt = $pdo->prepare("
            SELECT COUNT(*) 
            FROM audit_logs 
            WHERE action = 'login_failed' 
            AND ip_address = ? 
            AND created_at > (NOW() - INTERVAL 15 MINUTE)
        ");
        $stmt->execute([$ip]);
        $failedAttempts = $stmt->fetchColumn();

        if ($failedAttempts >= 10) {
            blockIP($pdo, $ip, 'Brute force login attempts');
            ob_clean();
            echo json_encode(["error" => "Access denied. Host blocked."]);
            exit;
        }

        ob_clean();
        echo json_encode(["error" => "Invalid credentials"]);
        exit;
    }

    // --------------------------------------------------
    // RISK ENGINE (AFTER USER EXISTS)
    // --------------------------------------------------
    $risk = getUserRiskScore($pdo, $user['id']);
    $cooldown = getCooldownSeconds($risk);

    // --------------------------------------------------
    // FREEZE CHECK (CRITICAL FRAUD REJECTION)
    // --------------------------------------------------
    if ($risk >= 20) {
        freezeAccount($pdo, $user['id'], 'High fraud score during login');
        ob_clean();
        echo json_encode([
            "error" => "Account temporarily restricted. Contact support."
        ]);
        exit;
    }

    // --------------------------------------------------
    // EMAIL NOT VERIFIED CHECK
    // --------------------------------------------------
    if (!$user['is_verified']) {
        ob_clean();
        echo json_encode([
            "error" => "Email not verified. Please verify OTP."
        ]);
        exit;
    }

    // --------------------------------------------------
    // RISK COOLDOWN FLOW
    // --------------------------------------------------
    if ($risk >= 15 && $cooldown > 0) {
        auditLog($pdo, 'login_cooldown_applied', $user['id'], $ip, null, ['ip' => $ip]);
        ob_clean();
        echo json_encode([
            "success" => false,
            "message" => "Please wait before retrying login."
        ]);
        exit;
    }

    // --------------------------------------------------
    // LOGIN SUCCESS AUDIT & MFA DISPATCH
    // --------------------------------------------------
    auditLog($pdo, 'login_success', $user['id'], $ip, null, ['ip' => $ip]);

    // Use canonical user email from DB and capture dispatch status
    $otpSent = sendOTP($user['email'], 'login');

    if (!$otpSent) {
        ob_clean();
        echo json_encode([
            "success" => false,
            "error" => "Failed to send OTP email. Please wait 60 seconds before retrying or check mail settings."
        ]);
        exit;
    }

    ob_clean();
    echo json_encode([
        "success" => true,
        "message" => "OTP sent. Verify to complete login."
    ]);
    exit;

} catch (\Throwable $e) {
    ob_clean();
    
    error_log("Login API Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "error" => "An internal server error occurred. Please try again."
    ]);
    exit;
}