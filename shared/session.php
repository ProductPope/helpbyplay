<?php
// Fetches global stats from DB into $totalSessions and $totalPln.
// Requires config.php loaded first.

require_once __DIR__ . '/db.php';

$totalSessions = 0;
$totalPln      = 0.0;

try {
    $pdo = hbp_db();
    $row = $pdo->query('SELECT total_sessions, total_pln FROM stats WHERE id = 1')->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $totalSessions = (int)   $row['total_sessions'];
        $totalPln      = (float) $row['total_pln'];
    }
} catch (PDOException $e) {
    // Degrade gracefully — header stats show 0
    error_log('HBP session.php: ' . $e->getMessage());
}
