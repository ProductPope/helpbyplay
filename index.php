<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lang.php';
require_once __DIR__ . '/shared/session.php';
require_once __DIR__ . '/shared/layout.php';

$LANG = get_lang();

$games = [
    ['key' => 'cards',       'url' => '/games/cards/', 'active' => true],
    ['key' => '2048',        'active' => false],
    ['key' => 'snake',       'active' => false],
    ['key' => 'memory',      'active' => false],
    ['key' => 'minesweeper', 'active' => false],
    ['key' => 'flappy',      'active' => false],
];

render_header(
    t('site_title'),
    'page-index',
    $totalSessions,
    $totalPln,
    $LANG,
    '/assets/style.css',
    filemtime(__DIR__ . '/assets/style.css')
);
?>

        <div class="stats-bar">
            <span class="stats-item">👥 <strong class="stats-number"><?= number_format($totalSessions, 0, ',', ' ') ?></strong> <?= t('stat_players') ?></span>
            <span class="stats-dot" aria-hidden="true">·</span>
            <span class="stats-item">💰 <strong class="stats-number"><?= number_format($totalPln, 4, ',', ' ') ?></strong> <?= t('currency') ?> <?= t('stat_raised') ?></span>
        </div>

        <section class="game-selector">
            <h2 class="game-selector-title"><?= t('games_section_title') ?></h2>
            <div class="game-tiles">

<?php foreach ($games as $g):
    $tag    = $g['active'] ? 'a' : 'div';
    $href   = $g['active'] ? ' href="' . htmlspecialchars($g['url']) . '"' : '';
    $cls    = 'game-tile' . ($g['active'] ? '' : ' game-tile--coming-soon');
    $nameKey = 'game_' . $g['key'] . '_name';
?>
                <<?= $tag ?><?= $href ?> class="<?= $cls ?>">
                    <div class="game-tile-preview">
<?php if ($g['key'] === 'cards'): ?>
                        <svg viewBox="0 0 60 60" width="56" height="56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <text class="tile-suit" x="7"  y="27" font-size="22" fill="#E53935">♥</text>
                            <text class="tile-suit" x="31" y="27" font-size="22" fill="#1565C0">♦</text>
                            <text class="tile-suit" x="7"  y="54" font-size="22" fill="#0D1117">♣</text>
                            <text class="tile-suit" x="31" y="54" font-size="22" fill="#0D1117">♠</text>
                        </svg>
<?php else: ?>
                        <svg viewBox="0 0 60 60" width="48" height="48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <circle cx="30" cy="30" r="22" fill="#E2E8F0"/>
                            <text x="30" y="39" text-anchor="middle" font-size="26" font-weight="700" fill="#9CA3AF">?</text>
                        </svg>
<?php endif; ?>
                    </div>
                    <div class="game-tile-info">
                        <span class="game-tile-name"><?= t($nameKey) ?></span>
                        <span class="game-tile-action"><?= $g['active'] ? t('btn_play_game') : t('coming_soon') ?></span>
                    </div>
                </<?= $tag ?>>
<?php endforeach; ?>

            </div>
        </section>

        <section class="foundation-card">
            <?php if (FOUNDATION_LOGO): ?>
                <img src="<?= htmlspecialchars(FOUNDATION_LOGO) ?>" alt="<?= htmlspecialchars(FOUNDATION_NAME) ?>" class="foundation-logo">
            <?php endif; ?>
            <h2 class="foundation-name"><?= htmlspecialchars(FOUNDATION_NAME) ?></h2>
            <p class="foundation-desc"><?= htmlspecialchars(FOUNDATION_DESC) ?></p>
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

<?php render_footer($LANG); ?>

<script src="/shared/assets/lang.js?v=<?= filemtime(__DIR__ . '/shared/assets/lang.js') ?>"></script>
</body>
</html>
