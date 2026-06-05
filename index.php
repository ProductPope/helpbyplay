<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lang.php';
require_once __DIR__ . '/shared/session.php';
require_once __DIR__ . '/shared/layout.php';

$LANG = get_lang();

$games = [
    ['key' => 'cards',       'url' => '/games/cards/', 'active' => true],
    ['key' => '2048',        'url' => '/games/2048/', 'active' => true],
    ['key' => 'snake',       'url' => '/games/snake/', 'active' => true],
    ['key' => 'memory',      'url' => '/games/memory/', 'active' => true],
    ['key' => 'saper',       'url' => '/games/saper/', 'active' => true],
    ['key' => 'platformer',  'url' => '/games/platformer/', 'active' => true],
    ['key' => 'jumper',      'url' => '/games/jumper/', 'active' => true],
    ['key' => 'invaders',    'url' => '/games/invaders/', 'active' => true],
    ['key' => 'bricks',      'url' => '/games/bricks/', 'active' => true],
    ['key' => 'runner',      'url' => '/games/runner/', 'active' => true],
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

        <div class="foundation-banner">
            <?= htmlspecialchars(t('playing_for')) ?> <strong><?= htmlspecialchars(FOUNDATION_NAME) ?></strong>
        </div>

        <div class="stats-bar">
            <span class="stats-item">👥 <strong class="stats-number"><?= number_format($totalSessions, 0, ',', ' ') ?></strong> <?= t('stat_players') ?></span>
            <span class="stats-dot" aria-hidden="true">·</span>
            <span class="stats-item">💰 <strong class="stats-number"><?= number_format($totalPln, 4, ',', ' ') ?></strong> <?= t('currency') ?> <?= t('stat_raised') ?></span>
            <span class="stats-dot" aria-hidden="true">·</span>
            <a href="/statystyki.php" class="stats-link"><?= t('stats_link_text') ?></a>
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
                    <?= game_thumbnail_svg($g['key'], 52) ?>
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

        <?php render_ad_slot(); ?>

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
