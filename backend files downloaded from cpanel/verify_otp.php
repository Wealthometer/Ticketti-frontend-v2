<?php
require_once __DIR__ . '/../config.php';

header("Content-Type: application/json");

require_once __DIR__ . '/../../helpers/audit.php';

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$otp   = trim($data['otp'] ?? '');
$type  = trim($data['type'] ?? '');

if (!$email || !$otp || !$type) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? null;

// --------------------------------------------------
// GET USER
// --------------------------------------------------
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["error" => "Invalid user"]);
    exit;
}

// --------------------------------------------------
// VERIFY OTP
// --------------------------------------------------
$stmt = $pdo->prepare("
    SELECT * FROM email_otps
    WHERE user_id = ?
    AND otp = ?
    AND type = ?
    AND verified = 0
    AND expires_at > NOW()
    ORDER BY id DESC
    LIMIT 1
");

$stmt->execute([$user['id'], $otp, $type]);
$otpRow = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$otpRow) {
    auditLog($pdo, 'otp_failed', $user['id'], null, null, ['ip' => $ip], [
        'type' => $type
    ]);

    echo json_encode(["error" => "Invalid OTP"]);
    exit;
}

// --------------------------------------------------
// MARK VERIFIED
// --------------------------------------------------
$pdo->prepare("UPDATE email_otps SET verified = 1 WHERE id = ?")
    ->execute([$otpRow['id']]);

// --------------------------------------------------
// REGISTER FLOW ONLY
// --------------------------------------------------
if ($type === 'register') {
    $pdo->prepare("UPDATE users SET is_verified = 1 WHERE id = ?")
        ->execute([$user['id']]);

    auditLog($pdo, 'otp_verified_register', $user['id'], null, null, ['ip' => $ip]);

    echo json_encode([
        "success" => true,
        "message" => "Email verified"
    ]);
    exit;
}

// --------------------------------------------------
// LOGIN FLOW → HAND OFF TO COMPLETE LOGIN
// --------------------------------------------------
if ($type === 'login') {
    auditLog($pdo, 'otp_verified_login', $user['id'], null, null, ['ip' => $ip]);

    echo json_encode([
        "success" => true,
        "message" => "OTP verified. Proceed to login completion."
    ]);
    exit;
}

// --------------------------------------------------
// FIXED: FORGOT PASSWORD FLOW
// --------------------------------------------------
if ($type === 'forgot_password') {
    auditLog($pdo, 'otp_verified_forgot', $user['id'], null, null, ['ip' => $ip]);

    // Generate a secure single-use token for the reset-password step
    $resetToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    // Save token to your password_resets table (or similar schema tracking mechanism)
    $stmt = $pdo->prepare("
        INSERT INTO password_resets (user_id, token, expires_at) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$user['id'], $resetToken, $expiresAt]);

    echo json_encode([
        "success" => true,
        "message" => "OTP verified successfully.",
        "reset_token" => $resetToken // Pass this to your change-password API payload
    ]);
    exit;
}

// --------------------------------------------------
// FALLBACK FOR UNHANDLED TYPES
// --------------------------------------------------
echo json_encode([
    "error" => "Invalid verification context type"
]);
exit;