<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lang.php';

$LANG = get_lang();

// Fetch global stats directly from DB
$totalSessions = 0;
$totalPln      = 0.0;

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $row = $pdo->query('SELECT total_sessions, total_pln FROM stats WHERE id = 1')->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $totalSessions = (int)   $row['total_sessions'];
        $totalPln      = (float) $row['total_pln'];
    }
} catch (PDOException $e) {
    // Silently degrade — counter shows 0
}
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($LANG) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= t('site_title') ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css?v=<?php echo filemtime(__DIR__.'/assets/style.css'); ?>">
    <?php if (defined('ADSENSE_CLIENT') && ADSENSE_CLIENT !== ''): ?>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?php echo htmlspecialchars(ADSENSE_CLIENT); ?>" crossorigin="anonymous"></script>
    <?php endif; ?>
</head>
<body class="page-index">

    <header class="site-header">
        <div class="container">
            <a href="index.php" class="header-home">Help By <span class="logo-play">Play</span></a>
            <p class="header-stats"><?= number_format($totalSessions, 0, ',', ' ') ?> <?= t('header_stats') ?> <?= number_format($totalPln, 4, ',', ' ') ?> <?= t('currency') ?></p>
        </div>
    </header>

    <main class="container">

        <section class="foundation-card">
            <?php if (FOUNDATION_LOGO): ?>
                <img src="<?= htmlspecialchars(FOUNDATION_LOGO) ?>" alt="<?= htmlspecialchars(FOUNDATION_NAME) ?>" class="foundation-logo">
            <?php endif; ?>
            <h1 class="foundation-name"><?= htmlspecialchars(FOUNDATION_NAME) ?></h1>
            <p class="foundation-desc"><?= htmlspecialchars(FOUNDATION_DESC) ?></p>
        </section>

        <section class="global-counter">
            <p class="counter-label"><?= t('global_counter_label') ?></p>
            <p class="counter-value"><?= number_format($totalPln, 4, ',', ' ') ?> <?= t('currency') ?></p>
            <p class="sessions-value"><?= number_format($totalSessions, 0, ',', ' ') ?> <?= t('sessions_label') ?></p>
        </section>

        <section class="cta">
            <a href="game.php" class="btn-play"><?= t('btn_play') ?></a>
        </section>

        <p class="about-blurb">
            <?= htmlspecialchars(t('about_text')) ?>
            <a href="https://github.com/ProductPope/helpbyplay" target="_blank" rel="noopener"><?= t('about_link') ?></a>
        </p>

        <!-- ADSENSE_PLACEHOLDER -->
        <div class="ad-wrapper">
            <?php if (defined('ADSENSE_CLIENT') && ADSENSE_CLIENT !== '' && defined('ADSENSE_SLOT') && ADSENSE_SLOT !== ''): ?>
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="<?php echo htmlspecialchars(ADSENSE_CLIENT); ?>"
                 data-ad-slot="<?php echo htmlspecialchars(ADSENSE_SLOT); ?>"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            <?php else: ?>
            <div class="ad-placeholder">
                <span class="ad-placeholder-icon">📢</span>
                <span class="ad-placeholder-text"><?= t('ad_placeholder') ?></span>
            </div>
            <?php endif; ?>
        </div>

        <section class="how-it-works">
            <h2><?= t('how_it_works_title') ?></h2>
            <ol>
                <li><?= t('how_it_works_1') ?></li>
                <li><?= t('how_it_works_2') ?></li>
                <li><?= t('how_it_works_3') ?></li>
            </ol>
        </section>

    </main>

    <footer class="site-footer">
        <div class="container">
            <p class="footer-opensource">
                <?= t('footer_opensource') ?>
                <a href="https://helpbyplay.com" target="_blank" rel="noopener"><?= t('footer_about_link') ?></a>
                &middot;
                <a href="https://github.com/ProductPope/helpbyplay" target="_blank" rel="noopener">GitHub</a>
            </p>
            <div class="lang-switcher">
                <button onclick="switchLang('pl')" class="<?= $LANG === 'pl' ? 'active' : '' ?>"><?= t('lang_pl') ?></button>
                <button onclick="switchLang('en')" class="<?= $LANG === 'en' ? 'active' : '' ?>"><?= t('lang_en') ?></button>
            </div>
        </div>
    </footer>

    <script src="assets/lang.js?v=<?php echo filemtime(__DIR__.'/assets/lang.js'); ?>"></script>
</body>
</html>
