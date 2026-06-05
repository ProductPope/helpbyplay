<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../shared/display_offset.php'; // remove for new NGO instances

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $row = $pdo->query('SELECT total_sessions, total_pln FROM stats WHERE id = 1')->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'total_sessions' => (int)$row['total_sessions'] + DISPLAY_SESSIONS_OFFSET,
        'total_pln'      => (float)$row['total_pln'] + DISPLAY_PLN_OFFSET,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
