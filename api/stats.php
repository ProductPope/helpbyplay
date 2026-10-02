<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/display_offset.php'; // offsets are 0 on new NGO instances

try {
    $pdo = hbp_db();

    $row = $pdo->query('SELECT total_sessions, total_pln FROM stats WHERE id = 1')->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'total_sessions' => (int)$row['total_sessions'] + DISPLAY_SESSIONS_OFFSET,
        'total_pln'      => (float)$row['total_pln'] + DISPLAY_PLN_OFFSET,
    ]);
} catch (PDOException $e) {
    error_log('HBP stats: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
