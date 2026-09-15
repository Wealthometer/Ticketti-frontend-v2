<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../../helpers/validation.php';
require_once __DIR__ . '/../../helpers/security.php';
require_once __DIR__ . '/../../helpers/send_otp.php';
require_once __DIR__ . '/../../vendor/autoload.php';

header("Content-Type: application/json");

$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request format']);
    exit;
}

$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($name === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']);
    exit;
}

// Check if user already exists
$stmt = $pdo->prepare("SELECT id, is_verified FROM users WHERE email = ?");
$stmt->execute([$email]);
$existing = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existing && $existing['is_verified']) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already exists']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

try {
    $pdo->beginTransaction();

    if (!$existing) {
        // Create a completely new user (NOT VERIFIED)
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password, is_verified)
            VALUES (?, ?, ?, 0)
        ");
        $stmt->execute([$name, $email, $hashedPassword]);
        $userId = $pdo->lastInsertId();

        // Initialize their platform wallet
        $pdo->prepare("
            INSERT INTO wallets (user_id, balance)
            VALUES (?, 0.00)
        ")->execute([$userId]);
        
    } else {
        $userId = $existing['id'];

        // FIXED: Update their profile data and password in case they changed it 
        // while trying to register again to get a fresh verification OTP.
        $stmt = $pdo->prepare("
            UPDATE users 
            SET name = ?, password = ? 
            WHERE id = ?
        ");
        $stmt->execute([$name, $hashedPassword, $userId]);
    }

    $pdo->commit();

    // Send registration confirmation OTP
    sendOTP($email, 'register');

    echo json_encode([
        'success' => true,
        'message' => 'OTP sent to email. Please verify.'
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}