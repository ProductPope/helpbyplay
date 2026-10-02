<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lang.php';
require_once __DIR__ . '/../../shared/session.php';
require_once __DIR__ . '/../../shared/layout.php';

$LANG = get_lang();

render_header(
    t('game_memory_name') . ' — ' . t('site_title'),
    'page-game',
    $totalSessions,
    $totalPln,
    $LANG,
    '/games/memory/game.css',
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

            <div class="memory-wrapper">

                <div class="memory-stats">
                    <div class="memory-stat">
                        <span class="memory-stat-label"><?= htmlspecialchars(t('saper_time')) ?></span>
                        <span id="mem-timer" class="memory-stat-value">0:00</span>
                    </div>
                    <div class="memory-stat">
                        <span class="memory-stat-label"><?= htmlspecialchars(t('memory_moves')) ?></span>
                        <span id="mem-moves" class="memory-stat-value">0</span>
                    </div>
                    <div class="memory-stat">
                        <span class="memory-stat-label"><?= htmlspecialchars(t('memory_pairs')) ?></span>
                        <span id="mem-pairs" class="memory-stat-value">—</span>
                    </div>
                </div>

                <div class="memory-grid-wrapper">
                    <div id="memory-grid" class="memory-grid memory-grid--4"
                         role="grid" aria-label="<?= htmlspecialchars(t('game_memory_name')) ?>"></div>

                    <div id="memory-tutorial" class="memory-tutorial" role="dialog" aria-modal="true">
                        <p class="tutorial-text"><?= htmlspecialchars(t('tutorial_memory')) ?></p>
                        <button id="btn-memory-start" class="tutorial-btn"><?= htmlspecialchars(t('tutorial_memory_btn')) ?></button>
                    </div>

                    <div id="memory-win" class="memory-win hidden" role="dialog" aria-modal="true">
                        <div class="memory-win-card">
                            <p class="memory-win-emoji">🎉</p>
                            <dl class="memory-win-stats">
                                <dt><?= htmlspecialchars(t('saper_time')) ?></dt>
                                <dd id="mem-win-time">—</dd>
                                <dt><?= htmlspecialchars(t('memory_moves')) ?></dt>
                                <dd id="mem-win-moves">—</dd>
                                <dt><?= htmlspecialchars(t('score_label')) ?></dt>
                                <dd id="mem-win-score">—</dd>
                                <dt><?= htmlspecialchars(t('saper_best')) ?></dt>
                                <dd id="mem-win-best">—</dd>
                            </dl>
                            <p id="mem-win-bonus" class="memory-win-bonus" style="display:none"><?= htmlspecialchars(t('memory_bonus')) ?></p>
                            <button id="btn-memory-restart" class="memory-win-btn"><?= htmlspecialchars(t('btn_restart')) ?></button>
                        </div>
                    </div>
                </div>

            </div>

            <?php render_below_game('memory'); ?>

        </section>

        <?php render_session_screens('memory'); ?>

        <div id="new-record-badge" class="new-record-badge" aria-live="polite" aria-atomic="true"><?= t('new_record') ?></div>

<?php render_footer($LANG); ?>

<script src="/shared/assets/lang.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/lang.js') ?>"></script>
<script src="/shared/assets/counter.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/counter.js') ?>"></script>
<script src="/games/memory/game.js?v=<?= filemtime(__DIR__ . '/game.js') ?>"></script>
<script src="/shared/assets/session.js?v=<?= filemtime(__DIR__ . '/../../shared/assets/session.js') ?>"></script>
</body>
</html>
