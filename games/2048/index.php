<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lang.php';
require_once __DIR__ . '/../../shared/session.php';
require_once __DIR__ . '/../../shared/layout.php';

$LANG = get_lang();

render_header(
    t('game_2048_name') . ' — ' . t('site_title'),
    'page-game',
    $totalSessions,
    $totalPln,
    $LANG,
    '/games/2048/game.css',
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

            <div id="board-2048" class="board-2048" tabindex="0" role="grid" aria-label="<?= t('game_2048_name') ?>">
                <div id="tutorial-overlay" class="tutorial-overlay">
                    <p class="tutorial-text"><?= htmlspecialchars(t('tutorial_2048')) ?></p>
                    <button id="btn-tutorial-ok" class="tutorial-btn"><?= htmlspecialchars(t('tutorial_2048_btn')) ?></button>
                </div>
            </div>

            <?php render_below_game('2048'); ?>

        </section>

        <!-- ===== GAME OVER SCREEN ===== -->
        <section id="screen-gameover" class="screen hidden">
            <div class="summary-card">
                <h1 class="summary-title"><?= t('game_2048_gameover_title') ?></h1>

                <dl class="summary-stats">
                    <dt><?= t('score_label') ?></dt>
                    <dd id="gameover-score">0</dd>

                    <dt><?= t('session_earned_label') ?></dt>
                    <dd id="gameover-earned" class="sum-earned-value">—</dd>
                </dl>

                <div class="summary-actions">
                    <button id="btn-2048-play-again" class="btn-play"><?= t('btn_play_again') ?></button>
                    <a href="/index.php" class="btn-secondary"><?= t('btn_back_home') ?></a>
                </div>
            </div>
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
                    <a href="/games/2048/" class="btn-play"><?= t('btn_play_again') ?></a>
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
                    <a href="/games/2048/" class="btn-play"><?= t('btn_play_again') ?></a>
                    <a href="/index.php" class="btn-secondary"><?= t('btn_back_home') ?></a>
                </div>
            </div>
        </section>

        <div id="new-record-badge" class="new-record-badge" aria-live="polite" aria-atomic="true"><?= t('new_record') ?></div>
        <div class="win-badge-2048"><?= t('game_2048_win_badge') ?></div>

<?php render_footer($LANG); ?>

<script src="/shared/assets/lang.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/lang.js') ?>"></script>
<script src="/shared/assets/counter.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/counter.js') ?>"></script>
<script src="/games/2048/game.js?v=<?= filemtime(__DIR__ . '/game.js') ?>"></script>
<script src="/shared/assets/session.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/session.js') ?>"></script>
</body>
</html>
