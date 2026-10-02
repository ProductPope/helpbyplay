<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/display_offset.php'; // offsets are 0 on new NGO instances

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    hbp_json_error(405, 'Method not allowed');
}

// Accept JSON (fetch) or form-encoded (sendBeacon with URLSearchParams)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    $body = $_POST;
}

$sessionId   = isset($body['session_id'])   ? (int)    $body['session_id']   : 0;
$token       = isset($body['token'])        ? (string) $body['token']        : '';
$durationSec = isset($body['duration_sec']) ? (int)    $body['duration_sec'] : 0;
$type        = isset($body['type'])         ? (string) $body['type']         : 'end';

if ($sessionId <= 0 || $durationSec < 0 || $token === '') {
    hbp_json_error(400, 'Invalid parameters');
}

try {
    $pdo = hbp_db();

    $stmt = $pdo->prepare(
        'SELECT token, TIMESTAMPDIFF(SECOND, started_at, NOW()) AS elapsed
           FROM sessions WHERE id = :id'
    );
    $stmt->execute([':id' => $sessionId]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$session || $session['token'] === null || !hash_equals($session['token'], $token)) {
        hbp_json_error(403, 'Invalid session');
    }

    // Server-side cap: claimed duration can never exceed real elapsed time
    // since session start — prevents counter inflation via forged requests
    $durationSec = min($durationSec, max((int) $session['elapsed'], 0), HBP_MAX_SESSION_SEC);

    if ($type === 'heartbeat') {
        // Save progress only — no ended_at, no global stats update.
        // ended_at IS NULL guard: a late heartbeat must not mutate an ended session
        $stmt = $pdo->prepare(
            'UPDATE sessions SET duration_sec = :dur, last_seen_at = NOW()
              WHERE id = :id AND ended_at IS NULL'
        );
        $stmt->execute([':dur' => $durationSec, ':id' => $sessionId]);
        echo json_encode(['ok' => true]);
        exit;
    }

    // type = 'end' or 'beacon': finalize session
    $pdo->beginTransaction();
    hbp_finalize_session($pdo, $sessionId, $durationSec);
    // Report what was actually recorded — a repeated end must not claim new earnings
    $stmt = $pdo->prepare('SELECT earned_pln FROM sessions WHERE id = :id');
    $stmt->execute([':id' => $sessionId]);
    $earned = (float) $stmt->fetchColumn();
    $row = $pdo->query('SELECT total_sessions, total_pln FROM stats WHERE id = 1')
               ->fetch(PDO::FETCH_ASSOC);
    $pdo->commit();

    echo json_encode([
        'session_earned' => $earned,
        'total_sessions' => (int) $row['total_sessions'] + DISPLAY_SESSIONS_OFFSET,
        'total_pln'      => round((float) $row['total_pln'] + DISPLAY_PLN_OFFSET, 4),
    ]);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('HBP session_end: ' . $e->getMessage());
    hbp_json_error(500, 'Database error');
}
