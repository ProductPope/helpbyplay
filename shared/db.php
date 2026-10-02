<?php
// Shared database access and session bookkeeping.
// Requires config.php loaded first.

const HBP_PLN_PER_SECOND   = 0.0001; // 0.001 PLN per 10 s of play
const HBP_MAX_SESSION_SEC  = 3600;   // hard cap on a single session's duration
const HBP_STALE_AFTER_SEC  = 900;    // open session with no heartbeat for 15 min is closed server-side
const HBP_STALE_SWEEP_MAX  = 50;     // max stale sessions closed per sweep
const HBP_IP_STARTS_WINDOW = 600;    // rate-limit window for session starts (seconds)
const HBP_IP_STARTS_MAX    = 120;    // max session starts per IP within the window
const HBP_IP_OPEN_MAX      = 50;     // max concurrently open sessions per IP (schools share one IP)

function hbp_db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
    return $pdo;
}

// Keyed hash of the client IP — used only for rate limiting, the raw IP is never stored.
function hbp_ip_hash(): string {
    return hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', DB_PASS . DB_NAME);
}

// Marks a session as ended and adds its earnings to the global total.
// Must be called inside a transaction. Returns false if the session was already ended.
// $stale = true: closed by the server sweep, so ended_at is the last heartbeat, not NOW().
function hbp_finalize_session(PDO $pdo, int $sessionId, int $durationSec, bool $stale = false): bool {
    $earnedPln = round($durationSec * HBP_PLN_PER_SECOND, 4);
    $endedAt   = $stale ? 'COALESCE(last_seen_at, started_at)' : 'NOW()';

    // ended_at IS NULL guard prevents double-counting when end, beacon and sweep race
    $stmt = $pdo->prepare(
        "UPDATE sessions
            SET ended_at     = $endedAt,
                duration_sec = :dur,
                earned_pln   = :earned
          WHERE id = :id
            AND ended_at IS NULL"
    );
    $stmt->execute([':dur' => $durationSec, ':earned' => $earnedPln, ':id' => $sessionId]);
    if ($stmt->rowCount() === 0) return false;

    // stats.total_sessions = count of unique devices with at least one completed session
    // (NOT total session count — incremented once per device_id)
    $isFirstCompletion = false;
    $stmt = $pdo->prepare('SELECT device_id FROM sessions WHERE id = :id');
    $stmt->execute([':id' => $sessionId]);
    $deviceId = $stmt->fetchColumn();

    if ($deviceId) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM sessions WHERE device_id = :did AND ended_at IS NOT NULL');
        $stmt->execute([':did' => $deviceId]);
        $isFirstCompletion = ((int) $stmt->fetchColumn() === 1);
    }

    $stmt = $pdo->prepare(
        'UPDATE stats
            SET total_sessions = total_sessions + :first_completion,
                total_pln      = total_pln + :earned
          WHERE id = 1'
    );
    $stmt->execute([':first_completion' => $isFirstCompletion ? 1 : 0, ':earned' => $earnedPln]);
    return true;
}

// Closes sessions whose browser never sent an end signal (mobile tab killed, crash, etc.)
// using the last duration saved by a heartbeat. Cheap enough to run on every session start.
function hbp_close_stale_sessions(PDO $pdo): void {
    $stmt = $pdo->prepare(
        'SELECT id, duration_sec FROM sessions
          WHERE ended_at IS NULL
            AND COALESCE(last_seen_at, started_at) < NOW() - INTERVAL ' . HBP_STALE_AFTER_SEC . ' SECOND
          ORDER BY id
          LIMIT ' . HBP_STALE_SWEEP_MAX
    );
    $stmt->execute();
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $pdo->beginTransaction();
        hbp_finalize_session($pdo, (int) $row['id'], min((int) $row['duration_sec'], HBP_MAX_SESSION_SEC), true);
        $pdo->commit();
    }
}

function hbp_json_error(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}
