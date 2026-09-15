<?php
// Start output buffering to prevent header/JSON corruption
ob_start();

ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");

use Firebase\JWT\JWT;

try {
    require_once __DIR__ . '/../config.php';
    require_once __DIR__ . '/../../helpers/audit.php';
    require_once __DIR__ . '/../../helpers/risk.php';
    require_once __DIR__ . '/../../helpers/risk_actions.php';
    require_once __DIR__ . '/../../vendor/autoload.php';

    

    // --------------------------------------------------
    // INPUT VALIDATION
    // --------------------------------------------------
    $data = json_decode(file_get_contents("php://input"), true);

    $email = trim(str_replace("\xc2\xa0", "", $data['email'] ?? ''));
    $otp   = trim($data['otp'] ?? '');

    if (empty($email) || empty($otp)) {
        ob_clean();
        echo json_encode(["error" => "Email and OTP code are required"]);
        exit;
    }

    // --------------------------------------------------
    // GET USER
    // --------------------------------------------------
    $stmt = $pdo->prepare("SELECT id, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        ob_clean();
        echo json_encode(["error" => "Invalid email or verification code"]);
        exit;
    }

    // --------------------------------------------------
    // VERIFY OTP CODE
    // --------------------------------------------------
    $stmt = $pdo->prepare("
        SELECT id 
        FROM email_otps 
        WHERE user_id = ? 
          AND otp = ? 
          AND type = 'login' 
          AND verified = 0 
          AND expires_at > NOW()
        ORDER BY id DESC 
        LIMIT 1
    ");
    $stmt->execute([$user['id'], $otp]);
    $validOtp = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$validOtp) {
        auditLog($pdo, 'otp_failed', $user['id'], $_SERVER['REMOTE_ADDR'] ?? '');
        
        ob_clean();
        echo json_encode(["error" => "Invalid or expired verification code"]);
        exit;
    }

    // --------------------------------------------------
    // BURN OTP (Prevent Replay Attacks)
    // --------------------------------------------------
    $stmt = $pdo->prepare("UPDATE email_otps SET verified = 1 WHERE id = ?");
    $stmt->execute([$validOtp['id']]);

    // --------------------------------------------------
    // FINAL RISK CHECK (GATEKEEPER)
    // --------------------------------------------------
    $risk = getUserRiskScore($pdo, $user['id']);

    if ($risk >= 20) {
        freezeAccount($pdo, $user['id'], 'Risk threshold exceeded during login completion');

        ob_clean();
        echo json_encode(["error" => "Account temporarily restricted"]);
        exit;
    }

    // --------------------------------------------------
    // AUDIT
    // --------------------------------------------------
    auditLog($pdo, 'login_completed', $user['id']);

    // --------------------------------------------------
    // ISSUE JWT
    // --------------------------------------------------
    global $jwt_secret;

    $payload = [
        'sub'   => $user['id'],
        'email' => $user['email'],
        'iat'   => time(),
        'exp'   => time() + (60 * 60 * 24 * 7)
    ];

    $jwt = JWT::encode($payload, $jwt_secret, 'HS256');

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    ob_clean();
    echo json_encode([
        "success" => true,
        "token"   => $jwt
    ]);
    exit;

} catch (\Throwable $e) {
    ob_clean();
    error_log("OTP Verification Error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode(["error" => "An internal server error occurred."]);
    exit;
}