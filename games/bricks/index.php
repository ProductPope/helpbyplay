<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lang.php';
require_once __DIR__ . '/../../shared/session.php';
require_once __DIR__ . '/../../shared/layout.php';

$LANG = get_lang();

render_header(
    t('game_bricks_name') . ' — ' . t('site_title'),
    'page-game',
    $totalSessions,
    $totalPln,
    $LANG,
    '/games/bricks/game.css',
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
                        <span id="high-score" class="status-value status-value--hs">—</span>
                    </div>
                    <button id="btn-restart" class="btn-restart" aria-label="<?= t('btn_restart') ?>">↺</button>
                </div>
            </div>

            <div id="ad-wait-msg"><?= t('ad_wait_msg') ?></div>

            <?php render_ad_slot(); ?>

            <div class="bricks-wrapper">
                <canvas id="bricks-canvas" role="img" aria-label="<?= t('game_bricks_name') ?>"></canvas>

                <!-- Tutorial overlay -->
                <div id="bricks-tutorial" class="bricks-overlay">
                    <p class="bricks-overlay-title"><?= htmlspecialchars(t('game_bricks_name')) ?></p>
                    <p class="bricks-overlay-text"><?= htmlspecialchars(t('tutorial_bricks')) ?></p>
                    <button id="btn-bricks-start" class="bricks-btn"><?= htmlspecialchars(t('tutorial_bricks_btn')) ?></button>
                </div>

                <!-- Level clear overlay -->
                <div id="bricks-levelclear" class="bricks-overlay">
                    <p id="bricks-level-text" class="bricks-overlay-title"></p>
                    <div id="bricks-countdown" class="bricks-countdown">3</div>
                </div>

                <!-- Game over overlay -->
                <div id="bricks-gameover" class="bricks-overlay">
                    <p class="bricks-overlay-title"><?= htmlspecialchars(t('bricks_game_over_title')) ?></p>
                    <div id="bricks-final-score" class="bricks-overlay-score">0</div>
                    <p id="bricks-highscore" class="bricks-overlay-hs">0</p>
                    <p id="bricks-new-record" class="bricks-new-record" style="display:none"><?= t('new_record') ?></p>
                    <button id="btn-bricks-restart" class="bricks-btn"><?= htmlspecialchars(t('btn_play_again')) ?></button>
                </div>
            </div>

            <?php render_below_game('bricks'); ?>

        </section>

        <?php render_session_screens('bricks'); ?>

        <div id="new-record-badge" class="new-record-badge" aria-live="polite" aria-atomic="true"><?= t('new_record') ?></div>

<?php render_footer($LANG); ?>

<script src="/shared/assets/lang.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/lang.js') ?>"></script>
<script src="/shared/assets/counter.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/counter.js') ?>"></script>
<script src="/games/bricks/game.js?v=<?= filemtime(__DIR__ . '/game.js') ?>"></script>
<script src="/shared/assets/session.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/session.js') ?>"></script>
</body>
</html>
