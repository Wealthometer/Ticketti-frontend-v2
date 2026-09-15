<?php

date_default_timezone_set('Africa/Lagos');

// ====================================
//  ENV MODE
// ====================================
$APP_ENV = $_ENV['APP_ENV'] ?? 'production';

// ====================================
//  UNIVERSAL CORS (HTTP ONLY)
// ====================================
if (php_sapi_name() !== 'cli') {

    $allowedOrigins = [
        'http://localhost:5173',
        'https://ticketii.com.ng',
        'https://www.ticketii.com.ng'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Vary: Origin");
        header("Access-Control-Allow-Credentials: true");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    // ✅ DEBUG ONLY IN DEV
    if ($APP_ENV === 'development') {
        $debugFile = __DIR__ . '/cors_debug.log';
        file_put_contents($debugFile, json_encode($_SERVER, JSON_PRETTY_PRINT), FILE_APPEND);
    }
}

// ====================================
//  AUTOLOAD
// ====================================
require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// ====================================
//  LOAD ENV
// ====================================
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// ====================================
//  REQUIRED ENV CHECK
// ====================================
$required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'JWT_SECRET'];

foreach ($required as $key) {
    if (empty($_ENV[$key])) {
        die("Missing ENV: $key");
    }
}

// ====================================
//  DATABASE
// ====================================
try {
    $pdo = new PDO(
        "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset=utf8mb4",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_PERSISTENT => true
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}

// ====================================
//  JWT SECRET (FROM ENV)
// ====================================
$jwt_secret = $_ENV['JWT_SECRET'];