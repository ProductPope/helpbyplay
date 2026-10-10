<?php
// Hub counter sync — run by cron on core.helpbyplay.com only, e.g. every 5 minutes:
//   */5 * * * * /usr/local/bin/php /home/USER/domains/core.helpbyplay.com/public_html/cron/sync_instances.php
// Fetches each active instance's own totals from its /api/stats.php and stores them
// in the instances table. An unreachable instance keeps its last known totals.

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../shared/db.php';
require_once __DIR__ . '/../shared/display_offset.php';

const HBP_SYNC_TIMEOUT_SEC = 5;

if (!HBP_IS_HUB) {
    fwrite(STDERR, "HBP_IS_HUB is not enabled in config.php — nothing to do.\n");
    exit(0);
}

// Returns [own_sessions, own_pln] or an error string.
function hbp_fetch_instance(string $url) {
    $ctx = stream_context_create(['http' => [
        'timeout'       => HBP_SYNC_TIMEOUT_SEC,
        'ignore_errors' => true,
        'header'        => "Accept: application/json\r\nUser-Agent: HelpByPlay-hub-sync\r\n",
    ]]);
    $body = @file_get_contents($url, false, $ctx);
    if ($body === false) return 'request failed';

    $status = isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m) ? (int) $m[1] : 0;
    if ($status !== 200) return "HTTP $status";

    $data = json_decode($body, true);
    // own_* = the instance's own DB totals, without its offsets or hub sums
    if (!is_array($data) || !isset($data['own_sessions'], $data['own_pln'])
        || !is_numeric($data['own_sessions']) || !is_numeric($data['own_pln'])) {
        return 'invalid response (instance not upgraded?)';
    }
    $sessions = (int) $data['own_sessions'];
    $pln      = (float) $data['own_pln'];
    if ($sessions < 0 || $pln < 0) return 'negative totals';
    return [$sessions, $pln];
}

try {
    $pdo = hbp_db();
    $instances = $pdo->query('SELECT id, name, stats_url FROM instances WHERE active = 1 ORDER BY id')
                     ->fetchAll(PDO::FETCH_ASSOC);

    $ok   = $pdo->prepare('UPDATE instances SET last_sessions = :s, last_pln = :p, last_ok_at = NOW(), last_error = NULL WHERE id = :id');
    $fail = $pdo->prepare('UPDATE instances SET last_error = :e WHERE id = :id');

    $failures = 0;
    foreach ($instances as $inst) {
        $result = hbp_fetch_instance($inst['stats_url']);
        if (is_array($result)) {
            $ok->execute([':s' => $result[0], ':p' => round($result[1], 4), ':id' => $inst['id']]);
        } else {
            $failures++;
            $fail->execute([':e' => substr($result, 0, 255), ':id' => $inst['id']]);
            fwrite(STDERR, "{$inst['name']} ({$inst['stats_url']}): $result\n");
        }
    }
    exit($failures > 0 ? 1 : 0);
} catch (PDOException $e) {
    error_log('HBP sync_instances: ' . $e->getMessage());
    fwrite(STDERR, "Database error\n");
    exit(1);
}
