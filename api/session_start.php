<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../shared/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    hbp_json_error(405, 'Method not allowed');
}

$body     = json_decode(file_get_contents('php://input'), true) ?? [];
$deviceId = isset($body['device_id']) ? (string) $body['device_id'] : null;

// Validate UUID format; discard if malformed
if ($deviceId !== null && !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $deviceId)) {
    $deviceId = null;
}

try {
    $pdo    = hbp_db();
    $ipHash = hbp_ip_hash();

    hbp_close_stale_sessions($pdo);

    // Rate limit per IP — guards the global counter against scripted session farming
    $stmt = $pdo->prepare(
        'SELECT
            SUM(started_at >= NOW() - INTERVAL ' . HBP_IP_STARTS_WINDOW . ' SECOND) AS recent,
            SUM(ended_at IS NULL) AS open_now
           FROM sessions
          WHERE ip_hash = :ip
            AND (ended_at IS NULL OR started_at >= NOW() - INTERVAL ' . HBP_IP_STARTS_WINDOW . ' SECOND)'
    );
    $stmt->execute([':ip' => $ipHash]);
    $limits = $stmt->fetch(PDO::FETCH_ASSOC);

    if ((int) $limits['recent'] >= HBP_IP_STARTS_MAX || (int) $limits['open_now'] >= HBP_IP_OPEN_MAX) {
        hbp_json_error(429, 'Too many sessions');
    }

    // Secret token proves ownership of the session — IDs are sequential and guessable
    $token = bin2hex(random_bytes(16));

    $stmt = $pdo->prepare(
        'INSERT INTO sessions (device_id, token, ip_hash, started_at, last_seen_at)
         VALUES (:did, :token, :ip, NOW(), NOW())'
    );
    $stmt->execute([':did' => $deviceId, ':token' => $token, ':ip' => $ipHash]);

    echo json_encode(['session_id' => (int) $pdo->lastInsertId(), 'token' => $token]);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('HBP session_start: ' . $e->getMessage());
    hbp_json_error(500, 'Database error');
}
