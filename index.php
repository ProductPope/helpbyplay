<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lang.php';
require_once __DIR__ . '/shared/session.php';
require_once __DIR__ . '/shared/layout.php';

$LANG = get_lang();

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

        <section class="game-selector">
            <h2 class="game-selector-title"><?= t('games_section_title') ?></h2>
            <div class="game-card">
                <h3 class="game-card-name"><?= t('game_cards_name') ?></h3>
                <p class="game-card-desc"><?= t('game_cards_desc') ?></p>
                <a href="/games/cards/" class="btn-play"><?= t('btn_play') ?></a>
            </div>
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
