<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lang.php';
require_once __DIR__ . '/../../shared/session.php';
require_once __DIR__ . '/../../shared/layout.php';

$LANG = get_lang();

render_header(
    t('game_invaders_name') . ' — ' . t('site_title'),
    'page-game',
    $totalSessions,
    $totalPln,
    $LANG,
    '/games/invaders/game.css',
    filemtime(__DIR__ . '/game.css')
);
?>

        <!-- ===== GAME SCREEN ===== -->
        <section id="screen-game" class="screen">

            <div class="status-bar">
                <div class="status-item">
                    <span class="status-label"><?= t('session_earned_label') ?></span>
                    <span id="session-counter" class="session-counter-value status-value status-earned">0.0000 <?= t('currency') ?></span>
                </div>
                <div class="status-item status-item--center">
                    <span class="status-label"><?= t('score_label') ?></span>
                    <span id="session-score" class="status-value">0</span>
                </div>
                <div class="status-right">
                    <div class="status-item status-item--right">
                        <span class="status-label"><?= t('highscore_label') ?></span>
                        <span id="high-score" class="status-value status-value--hs">0</span>
                    </div>
                    <button id="btn-restart" class="btn-restart" aria-label="<?= t('btn_restart') ?>">↺</button>
                </div>
            </div>

            <div id="ad-wait-msg"><?= t('ad_wait_msg') ?></div>

            <?php render_ad_slot(); ?>

            <div class="invaders-wrapper">
                <canvas id="invaders-canvas" role="img" aria-label="<?= t('game_invaders_name') ?>"></canvas>
                <div id="invaders-tutorial" class="invaders-tutorial">
                    <p class="tutorial-text"><?= htmlspecialchars(t('tutorial_invaders')) ?></p>
                    <button id="btn-invaders-start" class="tutorial-btn"><?= htmlspecialchars(t('tutorial_invaders_btn')) ?></button>
                </div>
            </div>

            <!-- Mobile controls (hidden on desktop via CSS) -->
            <div class="invaders-mobile-controls" id="invaders-mobile-controls">
                <button id="btn-inv-left"  class="inv-ctrl-btn" aria-label="Left">◀</button>
                <button id="btn-inv-fire"  class="inv-ctrl-btn inv-ctrl-fire" aria-label="Fire">▲</button>
                <button id="btn-inv-right" class="inv-ctrl-btn" aria-label="Right">▶</button>
            </div>

            <?php render_below_game('invaders'); ?>

        </section>

        <?php render_session_screens('invaders'); ?>

        <div id="new-record-badge" class="new-record-badge" aria-live="polite" aria-atomic="true"><?= t('new_record') ?></div>

<?php render_footer($LANG); ?>

<script src="/shared/assets/lang.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/lang.js') ?>"></script>
<script src="/shared/assets/counter.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/counter.js') ?>"></script>
<script src="/games/invaders/game.js?v=<?= filemtime(__DIR__ . '/game.js') ?>"></script>
<script src="/shared/assets/session.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/session.js') ?>"></script>
</body>
</html>
