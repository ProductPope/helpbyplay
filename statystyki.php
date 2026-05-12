<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lang.php';
require_once __DIR__ . '/shared/session.php';
require_once __DIR__ . '/shared/layout.php';

$LANG = get_lang();

// Per-period stats from sessions table
$today_sessions = 0; $today_pln = 0.0;
$week_sessions  = 0; $week_pln  = 0.0;
$players        = 0;
$avg_formatted  = '0:00';

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $row = $pdo->query("
        SELECT
            SUM(started_at >= CURDATE()) AS today_s,
            COALESCE(SUM(CASE WHEN started_at >= CURDATE() THEN earned_pln END), 0) AS today_pln,
            SUM(started_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)) AS week_s,
            COALESCE(SUM(CASE WHEN started_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) THEN earned_pln END), 0) AS week_pln,
            COUNT(DISTINCT device_id) AS players,
            COALESCE(AVG(NULLIF(duration_sec, 0)), 0) AS avg_sec
        FROM sessions
    ")->fetch(PDO::FETCH_ASSOC);

    $today_sessions = (int)   $row['today_s'];
    $today_pln      = (float) $row['today_pln'];
    $week_sessions  = (int)   $row['week_s'];
    $week_pln       = (float) $row['week_pln'];
    $players        = (int)   $row['players'];
    $avg_s          = (int)   $row['avg_sec'];
    $avg_formatted  = sprintf('%d:%02d', intdiv($avg_s, 60), $avg_s % 60);

} catch (PDOException $e) {
    // Silently degrade — zeros shown
}

render_header(
    t('stats_page_title') . ' — ' . t('site_title'),
    'page-stats',
    $totalSessions,
    $totalPln,
    $LANG
);
?>

        <h1 class="stats-heading"><?= htmlspecialchars(t('stats_page_title')) ?></h1>

        <div class="stats-grid">

            <div class="stat-card">
                <h2 class="stat-card-period"><?= htmlspecialchars(t('stats_today')) ?></h2>
                <div class="stat-row">
                    <span class="stat-value"><?= number_format($today_sessions, 0, ',', ' ') ?></span>
                    <span class="stat-label"><?= htmlspecialchars(t('stats_sessions_label')) ?></span>
                </div>
                <div class="stat-row">
                    <span class="stat-value stat-value--pln"><?= number_format($today_pln, 4, ',', ' ') ?></span>
                    <span class="stat-label"><?= htmlspecialchars(t('currency')) ?></span>
                </div>
            </div>

            <div class="stat-card">
                <h2 class="stat-card-period"><?= htmlspecialchars(t('stats_week')) ?></h2>
                <div class="stat-row">
                    <span class="stat-value"><?= number_format($week_sessions, 0, ',', ' ') ?></span>
                    <span class="stat-label"><?= htmlspecialchars(t('stats_sessions_label')) ?></span>
                </div>
                <div class="stat-row">
                    <span class="stat-value stat-value--pln"><?= number_format($week_pln, 4, ',', ' ') ?></span>
                    <span class="stat-label"><?= htmlspecialchars(t('currency')) ?></span>
                </div>
            </div>

            <div class="stat-card stat-card--alltime">
                <h2 class="stat-card-period"><?= htmlspecialchars(t('stats_alltime')) ?></h2>
                <div class="stat-row">
                    <span class="stat-value"><?= number_format($totalSessions, 0, ',', ' ') ?></span>
                    <span class="stat-label"><?= htmlspecialchars(t('stats_sessions_label')) ?></span>
                </div>
                <div class="stat-row">
                    <span class="stat-value stat-value--pln"><?= number_format($totalPln, 4, ',', ' ') ?></span>
                    <span class="stat-label"><?= htmlspecialchars(t('currency')) ?></span>
                </div>
                <div class="stat-row">
                    <span class="stat-value"><?= number_format($players, 0, ',', ' ') ?></span>
                    <span class="stat-label"><?= htmlspecialchars(t('stats_players_label')) ?></span>
                </div>
                <div class="stat-row">
                    <span class="stat-value"><?= htmlspecialchars($avg_formatted) ?></span>
                    <span class="stat-label"><?= htmlspecialchars(t('stats_avg_label')) ?></span>
                </div>
            </div>

        </div>

<?php render_footer($LANG); ?>

<script src="/shared/assets/lang.js?v=<?= filemtime(__DIR__ . '/shared/assets/lang.js') ?>"></script>
</body>
</html>
