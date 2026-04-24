<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lang.php';

$LANG = get_lang();
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($LANG) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= t('game_title') ?> &mdash; <?= t('site_title') ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css?v=<?php echo filemtime(__DIR__.'/assets/style.css'); ?>">
    <?php if (defined('ADSENSE_CLIENT') && ADSENSE_CLIENT !== ''): ?>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?php echo htmlspecialchars(ADSENSE_CLIENT); ?>" crossorigin="anonymous"></script>
    <?php endif; ?>
</head>
<body class="page-game">

    <header class="site-header">
        <div class="container">
            <a href="index.php" class="header-home">Help By <span class="logo-play">Play</span></a>
        </div>
    </header>

    <main class="container">

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

            <!-- ADSENSE_PLACEHOLDER -->
            <div class="ad-wrapper">
                <?php if (defined('ADSENSE_CLIENT') && ADSENSE_CLIENT !== '' && defined('ADSENSE_SLOT') && ADSENSE_SLOT !== ''): ?>
                <ins id="hbp-ad-ins" class="adsbygoogle"
                     style="display:block;width:100%;height:80px"
                     data-ad-client="<?php echo htmlspecialchars(ADSENSE_CLIENT); ?>"
                     data-ad-slot="<?php echo htmlspecialchars(ADSENSE_SLOT); ?>"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <div id="hbp-ad-fallback" class="ad-placeholder" style="display:none">
                    <span class="ad-placeholder-icon">📢</span>
                    <span class="ad-placeholder-text"><?= t('ad_placeholder') ?></span>
                </div>
                <script>(function() {
                    var ins = document.getElementById('hbp-ad-ins');
                    var fallback = document.getElementById('hbp-ad-fallback');
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    setTimeout(function() {
                        if (ins.children.length === 0) {
                            ins.style.display = 'none';
                            fallback.style.display = '';
                        }
                    }, 2000);
                })();</script>
                <?php else: ?>
                <div class="ad-placeholder">
                    <span class="ad-placeholder-icon">📢</span>
                    <span class="ad-placeholder-text"><?= t('ad_placeholder') ?></span>
                </div>
                <?php endif; ?>
            </div>

            <div id="game-grid" class="game-grid" role="grid" aria-label="<?= t('game_title') ?>"></div>

            <div class="game-foundation-info">
                <p class="game-story-text"><?= htmlspecialchars(t('game_story')) ?></p>
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
                    <a href="game.php" class="btn-play"><?= t('btn_play_again') ?></a>
                    <a href="index.php" class="btn-secondary"><?= t('btn_back_home') ?></a>
                </div>
            </div>

        </section>

        <div id="screen-error" class="screen hidden">
            <p class="error-msg"><?= t('error_session') ?></p>
            <a href="index.php" class="btn-secondary"><?= t('btn_back_home') ?></a>
        </div>

        <section id="screen-inactivity" class="screen hidden">
            <div class="summary-card">
                <h1 class="summary-title"><?= t('inactivity_title') ?></h1>
                <p class="summary-thanks"><?= t('inactivity_msg') ?></p>
                <div class="summary-actions">
                    <a href="game.php" class="btn-play"><?= t('btn_play_again') ?></a>
                    <a href="index.php" class="btn-secondary"><?= t('btn_back_home') ?></a>
                </div>
            </div>
        </section>

        <div id="new-record-badge" class="new-record-badge" aria-live="polite" aria-atomic="true"><?= t('new_record') ?></div>

    </main>

    <footer class="site-footer">
        <div class="container">
            <div class="lang-switcher">
                <button onclick="switchLang('pl')" class="<?= $LANG === 'pl' ? 'active' : '' ?>"><?= t('lang_pl') ?></button>
                <button onclick="switchLang('en')" class="<?= $LANG === 'en' ? 'active' : '' ?>"><?= t('lang_en') ?></button>
            </div>
            <p class="footer-about"><?= htmlspecialchars(t('about_text')) ?> <a href="https://helpbyplay.com" target="_blank" rel="noopener"><?= t('about_link') ?></a></p>
            <p><?= t('site_title') ?> &mdash; <a href="https://github.com/ProductPope/helpbyplay" target="_blank" rel="noopener">GPL v3</a></p>
        </div>
    </footer>

    <script src="assets/lang.js?v=<?php echo filemtime(__DIR__.'/assets/lang.js'); ?>"></script>
    <script src="assets/counter.js?v=<?php echo filemtime(__DIR__.'/assets/counter.js'); ?>"></script>
    <script src="assets/game.js?v=<?php echo filemtime(__DIR__.'/assets/game.js'); ?>"></script>
    <script>
    // --- translations exposed for JS ---
    const LANG_CURRENCY = <?= json_encode(t('currency')) ?>;
    const LANG_SECONDS  = <?= json_encode(t('seconds_short')) ?>;

    // --- session state ---
    let sessionId = null;

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    }

    async function startSession() {
        try {
            const res  = await fetch('api/session_start.php', { method: 'POST' });
            const data = await res.json();
            if (!data.session_id) throw new Error('no session_id');
            sessionId = data.session_id;
            showScreen('screen-game');
            initGame();
            startCounter();
        } catch (e) {
            showScreen('screen-error');
        }
    }

    async function autoEndSession() {
        if (!sessionId) return;
        stopCounter();

        const sid = sessionId;
        sessionId = null;
        const dur = getSessionSeconds();

        try {
            await fetch('api/session_end.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ session_id: sid, duration_sec: dur, type: 'end' }),
            });
        } catch (e) {
            // beacon on unload will save if this fails
        }

        showScreen('screen-inactivity');
    }

    // Save progress on tab switch (type=heartbeat — no ended_at, no stats)
    function sendBeaconSave() {
        if (!sessionId) return;
        navigator.sendBeacon('api/session_end.php', new URLSearchParams({
            session_id:   sessionId,
            duration_sec: getSessionSeconds(),
            type:         'heartbeat',
        }));
    }

    // Finalize session on browser close / navigation (type=beacon — ends session)
    function sendBeaconEnd() {
        if (!sessionId) return;
        const sid = sessionId;
        sessionId = null;
        navigator.sendBeacon('api/session_end.php', new URLSearchParams({
            session_id:   sid,
            duration_sec: getSessionSeconds(),
            type:         'beacon',
        }));
    }

    // Heartbeat every 30 active seconds
    document.addEventListener('counter:heartbeat', (e) => {
        if (!sessionId) return;
        fetch('api/session_end.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                session_id:   sessionId,
                duration_sec: e.detail.seconds,
                type:         'heartbeat',
            }),
        }).catch(() => {});
    });

    // Auto-end after 600s of inactivity
    document.addEventListener('counter:inactivity-timeout', () => autoEndSession());

    // Save on tab switch; end on close / navigate away
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') sendBeaconSave();
    });
    window.addEventListener('beforeunload', sendBeaconEnd);

    document.getElementById('btn-restart').addEventListener('click', restartGame);

    // Boot
    startSession();
    </script>
</body>
</html>
