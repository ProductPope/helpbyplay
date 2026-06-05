<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lang.php';
require_once __DIR__ . '/../../shared/session.php';
require_once __DIR__ . '/../../shared/layout.php';

$LANG = get_lang();

render_header(
    t('game_runner_name') . ' — ' . t('site_title'),
    'page-game',
    $totalSessions,
    $totalPln,
    $LANG,
    '/games/runner/game.css',
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

            <div class="runner-wrapper">
                <canvas id="runner-canvas" role="img" aria-label="<?= t('game_runner_name') ?>"></canvas>
            </div>

            <?php render_below_game('runner'); ?>

        </section>

        <!-- ===== SUMMARY SCREEN ===== -->
        <section id="screen-summary" class="screen hidden">

            <div class="summary-card">
                <h1 class="summary-title"><?= t('summary_title') ?></h1>

                <dl class="summary-stats">
                    <dt><?= t('summary_duration') ?></dt>
                    <dd id="sum-duration">—</dd>

                    <dt><?= t('summary_earned') ?></dt>
                    <dd id="sum-earned" class="sum-earned-value">—</dd>

                    <dt><?= t('summary_global') ?></dt>
                    <dd id="sum-global">—</dd>
                </dl>

                <p class="summary-thanks"><?= t('summary_thanks_msg') ?></p>

                <div class="summary-actions">
                    <a href="/games/runner/" class="btn-play"><?= t('btn_play_again') ?></a>
                    <a href="/index.php" class="btn-secondary"><?= t('btn_back_home') ?></a>
                </div>
            </div>

        </section>

        <div id="screen-error" class="screen hidden">
            <p class="error-msg"><?= t('error_session') ?></p>
            <a href="/index.php" class="btn-secondary"><?= t('btn_back_home') ?></a>
        </div>

        <section id="screen-inactivity" class="screen hidden">
            <div class="summary-card">
                <h1 class="summary-title"><?= t('inactivity_title') ?></h1>
                <p class="summary-thanks"><?= t('inactivity_msg') ?></p>
                <div class="summary-actions">
                    <a href="/games/runner/" class="btn-play"><?= t('btn_play_again') ?></a>
                    <a href="/index.php" class="btn-secondary"><?= t('btn_back_home') ?></a>
                </div>
            </div>
        </section>

        <div id="new-record-badge" class="new-record-badge" aria-live="polite" aria-atomic="true"><?= t('new_record') ?></div>

<?php render_footer($LANG); ?>

<script src="/shared/assets/lang.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/lang.js') ?>"></script>
<script src="/shared/assets/counter.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/counter.js') ?>"></script>
<script src="/games/runner/game.js?v=<?= filemtime(__DIR__ . '/game.js') ?>"></script>
<script src="/shared/assets/session.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/session.js') ?>"></script>
</body>
</html>
