<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/hub.php'; // display totals: offsets + other instances on the hub

try {
    $pdo = hbp_db();

    $row = $pdo->query('SELECT total_sessions, total_pln FROM stats WHERE id = 1')->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        // Public totals (v0.9 offset and, on the hub, all instances included)
        'total_sessions' => hbp_display_sessions((int) $row['total_sessions']),
        'total_pln'      => round(hbp_display_pln((float) $row['total_pln']), 4),
        // This instance's own DB totals only — read by the hub's cron/sync_instances.php
        'own_sessions'   => (int) $row['total_sessions'],
        'own_pln'        => round((float) $row['total_pln'], 4),
    ]);
} catch (PDOException $e) {
    error_log('HBP stats: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
