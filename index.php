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
<?php elseif ($g['key'] === '2048'): ?>
                        <svg viewBox="0 0 56 56" width="52" height="52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect width="56" height="56" rx="4" fill="#BBADA0"/>
                            <!-- row 1: empty cells -->
                            <rect x="3"  y="3"  width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="17" y="3"  width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="31" y="3"  width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="45" y="3"  width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <!-- row 2: empty cells -->
                            <rect x="3"  y="17" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="17" y="17" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="31" y="17" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="45" y="17" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <!-- row 3: empty cells -->
                            <rect x="3"  y="31" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="17" y="31" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="31" y="31" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <rect x="45" y="31" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/>
                            <!-- row 4: 2, 4, 8, 16 -->
                            <rect x="3"  y="45" width="11" height="11" rx="2" fill="#FFF9F0"/>
                            <text x="8"  y="53.5" text-anchor="middle" font-size="6" font-weight="700" fill="#776E65">2</text>
                            <rect x="17" y="45" width="11" height="11" rx="2" fill="#FFF3DC"/>
                            <text x="22" y="53.5" text-anchor="middle" font-size="6" font-weight="700" fill="#776E65">4</text>
                            <rect x="31" y="45" width="11" height="11" rx="2" fill="#FFBA73"/>
                            <text x="36" y="53.5" text-anchor="middle" font-size="6" font-weight="700" fill="#F9F6F2">8</text>
                            <rect x="45" y="45" width="11" height="11" rx="2" fill="#F9A04E"/>
                            <text x="50" y="53.5" text-anchor="middle" font-size="5" font-weight="700" fill="#F9F6F2">16</text>
                        </svg>
<?php elseif ($g['key'] === 'snake'): ?>
                        <svg viewBox="0 0 56 56" width="52" height="52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect width="56" height="56" rx="4" fill="#0a0a0a"/>
                            <!-- Snake body (L-shape): tail top-left, head bottom-right -->
                            <rect x="5"  y="16" width="9" height="9" rx="2" fill="#00ff41"/>
                            <rect x="16" y="16" width="9" height="9" rx="2" fill="#00ff41"/>
                            <rect x="27" y="16" width="9" height="9" rx="2" fill="#00ff41"/>
                            <rect x="27" y="27" width="9" height="9" rx="2" fill="#00ff41"/>
                            <!-- Head (lighter) -->
                            <rect x="27" y="38" width="9" height="9" rx="2" fill="#80ff80"/>
                            <!-- Apple -->
                            <circle cx="44" cy="27" r="5" fill="#ff3333"/>
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
