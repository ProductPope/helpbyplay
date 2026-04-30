<?php
// Shared page layout — render_header() and render_footer().
// Requires config.php and lang.php loaded before calling.

function render_header(
    string $pageTitle,
    string $bodyClass,
    int    $totalSessions,
    float  $totalPln,
    string $lang,
    string $extraCssHref    = '',
    int    $extraCssVersion = 0
): void {
    $sharedCssVer = filemtime(__DIR__ . '/assets/shared.css');
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/shared/assets/shared.css?v=<?= $sharedCssVer ?>">
<?php if ($extraCssHref !== ''): ?>
    <link rel="stylesheet" href="<?= htmlspecialchars($extraCssHref) ?>?v=<?= $extraCssVersion ?>">
<?php endif; ?>
<?php if (defined('ADSENSE_CLIENT') && ADSENSE_CLIENT !== ''): ?>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?= htmlspecialchars(ADSENSE_CLIENT) ?>" crossorigin="anonymous"></script>
<?php endif; ?>
</head>
<body class="<?= htmlspecialchars($bodyClass) ?>">

    <header class="site-header">
        <div class="container">
            <a href="/index.php" class="header-home">Help By <span class="logo-play">Play</span></a>
            <p class="header-stats"><?= number_format($totalSessions, 0, ',', ' ') ?> <?= t('header_stats') ?> <?= number_format($totalPln, 4, ',', ' ') ?> <?= t('currency') ?></p>
        </div>
    </header>

    <main class="container">
<?php
}

function render_below_game(string $game_id = ''): void {
    $all_games = ['cards', '2048', 'snake', 'saper', 'platformer', 'jumper', 'invaders', 'memory', 'bricks'];
    $other_games = array_filter($all_games, fn($key) => $key !== $game_id);
?>
<?php if ($game_id !== ''): ?>
    <section class="game-info">
        <h2><?= htmlspecialchars(t('game_' . $game_id . '_name')) ?></h2>
        <p><?= htmlspecialchars(t('game_' . $game_id . '_about')) ?></p>
        <h3><?= htmlspecialchars(t('how_to_play')) ?></h3>
        <p><?= htmlspecialchars(t('game_' . $game_id . '_tutorial')) ?></p>

        <h3 class="other-games-heading"><?= htmlspecialchars(t('other_games')) ?></h3>
        <div class="other-games-scroll">
<?php foreach ($other_games as $key): ?>
            <a href="/games/<?= htmlspecialchars($key) ?>/" class="other-games-tile">
                <span class="other-games-tile-letter"><?= htmlspecialchars(mb_substr(t('game_' . $key . '_name'), 0, 1)) ?></span>
                <span class="other-games-tile-name"><?= htmlspecialchars(t('game_' . $key . '_name')) ?></span>
            </a>
<?php endforeach; ?>
        </div>
    </section>
<?php endif; ?>

    <section class="game-info-card">
        <h2><?= htmlspecialchars(t('playing_for')) ?> <?= htmlspecialchars(FOUNDATION_NAME) ?></h2>
        <p><?= htmlspecialchars(FOUNDATION_DESC) ?></p>
    </section>

    <section class="game-info-card">
        <h2><?= htmlspecialchars(t('recommend_title')) ?></h2>
        <p><?= htmlspecialchars(t('recommend_text')) ?></p>
        <a href="https://helpbyplay.com" target="_blank" rel="noopener noreferrer"><?= htmlspecialchars(t('recommend_link')) ?></a>
    </section>
<?php
}

function render_footer(string $lang): void {
?>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p class="footer-opensource">
                <?= t('footer_opensource') ?>
                <a href="https://helpbyplay.com" target="_blank" rel="noopener"><?= t('footer_about_link') ?></a>
                &middot;
                <a href="https://github.com/ProductPope/helpbyplay" target="_blank" rel="noopener">GitHub</a>
                &middot;
                <a href="https://helpbyplay.com/polityka-prywatnosci.html" target="_blank" rel="noopener"><?= t('privacy_policy') ?></a>
            </p>
            <div class="lang-switcher">
                <button onclick="switchLang('pl')" class="<?= $lang === 'pl' ? 'active' : '' ?>"><?= t('lang_pl') ?></button>
                <button onclick="switchLang('en')" class="<?= $lang === 'en' ? 'active' : '' ?>"><?= t('lang_en') ?></button>
            </div>
            <p class="footer-ad-note"><?= htmlspecialchars(t('footer_ad_note')) ?></p>
        </div>
    </footer>
    <script>window.HBP_CONSENT_STRINGS={text:<?= json_encode(t('cookie_consent_text')) ?>,accept:<?= json_encode(t('cookie_accept')) ?>,decline:<?= json_encode(t('cookie_decline')) ?>};</script>
    <script src="/shared/assets/cookie-consent.js?v=<?= @filemtime(__DIR__ . '/assets/cookie-consent.js') ?>"></script>
<?php
}
