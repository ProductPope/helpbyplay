<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Accept JSON (fetch) or form-encoded (sendBeacon with URLSearchParams)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    $body = $_POST;
}

$sessionId   = isset($body['session_id'])   ? (int)    $body['session_id']   : 0;
$durationSec = isset($body['duration_sec']) ? (int)    $body['duration_sec'] : 0;
$type        = isset($body['type'])         ? (string) $body['type']         : 'end';

if ($sessionId <= 0 || $durationSec < 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid parameters']);
    exit;
}

$earnedPln = round($durationSec * 0.0001, 4);

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    if ($type === 'heartbeat') {
        // Save progress only — no ended_at, no global stats update
        $stmt = $pdo->prepare('UPDATE sessions SET duration_sec = :dur WHERE id = :id');
        $stmt->execute([':dur' => $durationSec, ':id' => $sessionId]);
        echo json_encode(['ok' => true]);
        exit;
    }

    // type = 'end' or 'beacon': finalize session
    $pdo->beginTransaction();

    // Guard: only update if not already ended — prevents double-counting
    // when beacon fires after a normal end or when both end+beacon race
    $stmt = $pdo->prepare(
        'UPDATE sessions
            SET ended_at     = NOW(),
                duration_sec = :dur,
                earned_pln   = :earned
          WHERE id = :id
            AND ended_at IS NULL'
    );
    $stmt->execute([':dur' => $durationSec, ':earned' => $earnedPln, ':id' => $sessionId]);

    if ($stmt->rowCount() > 0) {
        $stmt = $pdo->prepare(
            'UPDATE stats
                SET total_sessions = total_sessions + 1,
                    total_pln      = total_pln + :earned
              WHERE id = 1'
        );
        $stmt->execute([':earned' => $earnedPln]);
    }

    $row = $pdo->query('SELECT total_sessions, total_pln FROM stats WHERE id = 1')
                ->fetch(PDO::FETCH_ASSOC);

    $pdo->commit();

    echo json_encode([
        'session_earned' => $earnedPln,
        'total_sessions' => (int)   $row['total_sessions'],
        'total_pln'      => (float) $row['total_pln'],
    ]);
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
