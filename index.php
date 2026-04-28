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

        <h1 class="foundation-banner">
            <?= htmlspecialchars(t('playing_for')) ?> <?= htmlspecialchars(FOUNDATION_NAME) ?>
        </h1>

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
<?php elseif ($g['key'] === 'platformer'): ?>
                        <svg viewBox="0 0 56 56" width="52" height="52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <!-- Sky -->
                            <rect width="56" height="56" rx="4" fill="#5c94fc"/>
                            <!-- Hospital cross decorations -->
                            <rect x="4"  y="8"  width="8" height="2" fill="rgba(255,255,255,0.18)"/>
                            <rect x="7"  y="5"  width="2" height="8" fill="rgba(255,255,255,0.18)"/>
                            <rect x="42" y="12" width="6" height="2" fill="rgba(255,255,255,0.18)"/>
                            <rect x="44" y="10" width="2" height="6" fill="rgba(255,255,255,0.18)"/>
                            <!-- Floor -->
                            <rect x="0" y="46" width="56" height="10" fill="#5aa02c"/>
                            <rect x="0" y="51" width="56" height="5"  fill="#8b5e00"/>
                            <!-- Floating platform -->
                            <rect x="6"  y="30" width="26" height="8" fill="#5aa02c"/>
                            <rect x="6"  y="35" width="26" height="3" fill="#8b5e00"/>
                            <!-- Apple (food item) -->
                            <circle cx="44" cy="22" r="6" fill="#ee2222"/>
                            <circle cx="42" cy="20" r="2" fill="rgba(255,255,255,0.35)"/>
                            <rect x="43" y="14" width="2" height="5" fill="#228822"/>
                            <rect x="44" y="15" width="4" height="2" fill="#33bb33"/>
                            <!-- Virus (enemy) — green circle with spikes -->
                            <circle cx="44" cy="38" r="5" fill="#22aa22"/>
                            <line x1="44" y1="31" x2="44" y2="29" stroke="#22aa22" stroke-width="1.5"/>
                            <line x1="49" y1="33" x2="51" y2="31" stroke="#22aa22" stroke-width="1.5"/>
                            <line x1="49" y1="43" x2="51" y2="45" stroke="#22aa22" stroke-width="1.5"/>
                            <line x1="44" y1="45" x2="44" y2="47" stroke="#22aa22" stroke-width="1.5"/>
                            <line x1="39" y1="43" x2="37" y2="45" stroke="#22aa22" stroke-width="1.5"/>
                            <line x1="39" y1="33" x2="37" y2="31" stroke="#22aa22" stroke-width="1.5"/>
                            <circle cx="42" cy="37" r="1.5" fill="#fff"/>
                            <circle cx="46" cy="37" r="1.5" fill="#fff"/>
                            <circle cx="42.5" cy="37" r="0.8" fill="#000"/>
                            <circle cx="46.5" cy="37" r="0.8" fill="#000"/>
                            <!-- Doctor (white coat + cap with red cross) -->
                            <rect x="9"  y="22" width="12" height="10" fill="#f0f8ff"/>
                            <rect x="11" y="22" width="8"  height="2"  fill="#1155cc"/>
                            <rect x="13" y="20" width="2"  height="6"  fill="#1155cc"/>
                            <rect x="9"  y="16" width="12" height="7"  fill="#ffffff"/>
                            <rect x="7"  y="21" width="16" height="3"  fill="#ffffff"/>
                            <rect x="13" y="17" width="4"  height="2"  fill="#dd2222"/>
                            <rect x="14" y="15" width="2"  height="6"  fill="#dd2222"/>
                            <rect x="11" y="19" width="8"  height="5"  fill="#ffcc88"/>
                            <rect x="17" y="21" width="2"  height="2"  fill="#333"/>
                        </svg>
<?php elseif ($g['key'] === 'saper'): ?>
                        <svg viewBox="0 0 56 56" width="52" height="52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect width="56" height="56" rx="4" fill="#bdbdbd"/>
                            <!-- Revealed cells -->
                            <rect x="2"  y="2"  width="12" height="12" rx="1" fill="#c0c0c0"/>
                            <rect x="15" y="2"  width="12" height="12" rx="1" fill="#c0c0c0"/>
                            <rect x="28" y="2"  width="12" height="12" rx="1" fill="#c0c0c0"/>
                            <rect x="2"  y="15" width="12" height="12" rx="1" fill="#c0c0c0"/>
                            <rect x="15" y="15" width="12" height="12" rx="1" fill="#c0c0c0"/>
                            <rect x="2"  y="28" width="12" height="12" rx="1" fill="#c0c0c0"/>
                            <!-- Numbers -->
                            <text x="8"   y="12" text-anchor="middle" font-size="9" font-weight="700" fill="#1565C0" font-family="monospace">1</text>
                            <text x="21"  y="12" text-anchor="middle" font-size="9" font-weight="700" fill="#388E3C" font-family="monospace">2</text>
                            <text x="34"  y="12" text-anchor="middle" font-size="9" font-weight="700" fill="#C62828" font-family="monospace">3</text>
                            <text x="8"   y="25" text-anchor="middle" font-size="9" font-weight="700" fill="#388E3C" font-family="monospace">2</text>
                            <!-- Unrevealed cells -->
                            <rect x="41" y="2"  width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="28" y="15" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="41" y="15" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="15" y="28" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="28" y="28" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="41" y="28" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="2"  y="41" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="15" y="41" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="28" y="41" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <rect x="41" y="41" width="12" height="12" rx="1" fill="#d0d0cc"/>
                            <!-- Flag on cell at (41,15) -->
                            <rect x="47" y="17" width="1.5" height="9" rx="0.5" fill="#444"/>
                            <polygon points="48.5,17 48.5,22 43,19.5" fill="#e53935"/>
                        </svg>
<?php elseif ($g['key'] === 'invaders'): ?>
                        <svg viewBox="0 0 56 56" width="52" height="52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect width="56" height="56" rx="4" fill="#000"/>
                            <!-- UFO -->
                            <rect x="22" y="4" width="12" height="4" rx="2" fill="#ff2222"/>
                            <rect x="18" y="7" width="20" height="5" rx="2" fill="#ff2222"/>
                            <!-- Top row invaders (squid, 30pts) -->
                            <rect x="4"  y="16" width="8" height="6" rx="1" fill="#33ff33"/>
                            <rect x="16" y="16" width="8" height="6" rx="1" fill="#33ff33"/>
                            <rect x="28" y="16" width="8" height="6" rx="1" fill="#33ff33"/>
                            <rect x="40" y="16" width="8" height="6" rx="1" fill="#33ff33"/>
                            <!-- Middle row (octo, 20pts) -->
                            <rect x="4"  y="25" width="8" height="6" rx="1" fill="#33ff33"/>
                            <rect x="16" y="25" width="8" height="6" rx="1" fill="#33ff33"/>
                            <rect x="28" y="25" width="8" height="6" rx="1" fill="#33ff33"/>
                            <rect x="40" y="25" width="8" height="6" rx="1" fill="#33ff33"/>
                            <!-- Shields -->
                            <rect x="4"  y="40" width="8" height="5" fill="#228822"/>
                            <rect x="16" y="40" width="8" height="5" fill="#228822"/>
                            <rect x="32" y="40" width="8" height="5" fill="#228822"/>
                            <rect x="44" y="40" width="8" height="5" fill="#228822"/>
                            <!-- Player ship -->
                            <rect x="23" y="49" width="10" height="4" rx="1" fill="#33ff33"/>
                            <rect x="26" y="46" width="4"  height="5" rx="1" fill="#33ff33"/>
                        </svg>
<?php elseif ($g['key'] === 'jumper'): ?>
                        <svg viewBox="0 0 56 56" width="52" height="52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <!-- Sky gradient bg -->
                            <defs>
                                <linearGradient id="jsky" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#1a2a6a"/>
                                    <stop offset="100%" stop-color="#3a78d4"/>
                                </linearGradient>
                            </defs>
                            <rect width="56" height="56" rx="4" fill="url(#jsky)"/>
                            <!-- Platform 1 (bottom) -->
                            <rect x="4"  y="46" width="24" height="5" rx="2" fill="#5aa02c"/>
                            <!-- Platform 2 (mid) spring — yellow -->
                            <rect x="28" y="32" width="18" height="5" rx="2" fill="#f8d800"/>
                            <rect x="35" y="26" width="4"  height="6" rx="1" fill="#cc8800"/>
                            <rect x="32" y="24" width="10" height="3" rx="1" fill="#cc8800"/>
                            <!-- Platform 3 (top) -->
                            <rect x="8"  y="18" width="22" height="5" rx="2" fill="#7744cc"/>
                            <!-- Player -->
                            <rect x="12" y="6"  width="8"  height="12" rx="1" fill="#fff"/>
                            <rect x="13" y="5"  width="6"  height="6"  rx="1" fill="#ffcc88"/>
                            <rect x="13" y="3"  width="6"  height="4"  rx="1" fill="#553300"/>
                        </svg>
<?php elseif ($g['key'] === 'memory'): ?>
                        <svg viewBox="0 0 56 56" width="52" height="52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect width="56" height="56" rx="4" fill="#12123a"/>
                            <!-- Row 0: covered, revealed(🐶 orange), covered, revealed(🐶 matched) -->
                            <rect x="3"  y="3"  width="11" height="11" rx="2" fill="#1565C0"/>
                            <text x="8.5"  y="12"  text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.35)" font-weight="700">?</text>
                            <rect x="16" y="3"  width="11" height="11" rx="2" fill="#fff"/>
                            <circle cx="21.5" cy="8.5" r="3.5" fill="#ff9800"/>
                            <circle cx="19"   cy="5.5" r="1.2" fill="#ff9800"/>
                            <circle cx="24"   cy="5.5" r="1.2" fill="#ff9800"/>
                            <rect x="29" y="3"  width="11" height="11" rx="2" fill="#1565C0"/>
                            <text x="34.5" y="12"  text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.35)" font-weight="700">?</text>
                            <rect x="42" y="3"  width="11" height="11" rx="2" fill="#fff" stroke="#4CAF50" stroke-width="1.5"/>
                            <circle cx="47.5" cy="8.5" r="3.5" fill="#ff9800"/>
                            <circle cx="45"   cy="5.5" r="1.2" fill="#ff9800"/>
                            <circle cx="50"   cy="5.5" r="1.2" fill="#ff9800"/>
                            <!-- Row 1: revealed(🐱 purple), covered, revealed(🐱 matched), covered -->
                            <rect x="3"  y="16" width="11" height="11" rx="2" fill="#fff"/>
                            <circle cx="8.5"  cy="21.5" r="3.5" fill="#9c27b0"/>
                            <circle cx="6"    cy="18.5" r="1.2" fill="#9c27b0"/>
                            <circle cx="11"   cy="18.5" r="1.2" fill="#9c27b0"/>
                            <rect x="16" y="16" width="11" height="11" rx="2" fill="#1565C0"/>
                            <text x="21.5" y="25"  text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.35)" font-weight="700">?</text>
                            <rect x="29" y="16" width="11" height="11" rx="2" fill="#fff" stroke="#4CAF50" stroke-width="1.5"/>
                            <circle cx="34.5" cy="21.5" r="3.5" fill="#9c27b0"/>
                            <circle cx="32"   cy="18.5" r="1.2" fill="#9c27b0"/>
                            <circle cx="37"   cy="18.5" r="1.2" fill="#9c27b0"/>
                            <rect x="42" y="16" width="11" height="11" rx="2" fill="#1565C0"/>
                            <text x="47.5" y="25"  text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.35)" font-weight="700">?</text>
                            <!-- Rows 2-3: all covered -->
                            <rect x="3"  y="29" width="11" height="11" rx="2" fill="#1565C0"/>
                            <rect x="16" y="29" width="11" height="11" rx="2" fill="#1565C0"/>
                            <rect x="29" y="29" width="11" height="11" rx="2" fill="#1565C0"/>
                            <rect x="42" y="29" width="11" height="11" rx="2" fill="#1565C0"/>
                            <rect x="3"  y="42" width="11" height="11" rx="2" fill="#1565C0"/>
                            <rect x="16" y="42" width="11" height="11" rx="2" fill="#1565C0"/>
                            <rect x="29" y="42" width="11" height="11" rx="2" fill="#1565C0"/>
                            <rect x="42" y="42" width="11" height="11" rx="2" fill="#1565C0"/>
                            <text x="8.5"  y="38" text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.35)" font-weight="700">?</text>
                            <text x="21.5" y="38" text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.35)" font-weight="700">?</text>
                            <text x="34.5" y="38" text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.35)" font-weight="700">?</text>
                            <text x="47.5" y="38" text-anchor="middle" font-size="6" fill="rgba(255,255,255,0.35)" font-weight="700">?</text>
                        </svg>
<?php elseif ($g['key'] === 'bricks'): ?>
                        <svg viewBox="0 0 56 56" width="52" height="52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <!-- Background -->
                            <rect width="56" height="56" rx="4" fill="#000"/>
                            <!-- Brick rows: row 1 red -->
                            <rect x="2"  y="8"  width="10" height="5" rx="1" fill="#e53935"/>
                            <rect x="14" y="8"  width="10" height="5" rx="1" fill="#e53935"/>
                            <rect x="26" y="8"  width="10" height="5" rx="1" fill="#e53935"/>
                            <rect x="38" y="8"  width="10" height="5" rx="1" fill="#e53935"/>
                            <!-- Row 2 orange -->
                            <rect x="2"  y="15" width="10" height="5" rx="1" fill="#fb8c00"/>
                            <rect x="14" y="15" width="10" height="5" rx="1" fill="#fb8c00"/>
                            <rect x="26" y="15" width="10" height="5" rx="1" fill="#fb8c00"/>
                            <rect x="38" y="15" width="10" height="5" rx="1" fill="#fb8c00"/>
                            <!-- Row 3 yellow -->
                            <rect x="2"  y="22" width="10" height="5" rx="1" fill="#fdd835"/>
                            <rect x="14" y="22" width="10" height="5" rx="1" fill="#fdd835"/>
                            <rect x="26" y="22" width="10" height="5" rx="1" fill="#fdd835"/>
                            <rect x="38" y="22" width="10" height="5" rx="1" fill="#fdd835"/>
                            <!-- Row 4 green -->
                            <rect x="2"  y="29" width="10" height="5" rx="1" fill="#43a047"/>
                            <rect x="14" y="29" width="10" height="5" rx="1" fill="#43a047"/>
                            <rect x="26" y="29" width="10" height="5" rx="1" fill="#43a047"/>
                            <rect x="38" y="29" width="10" height="5" rx="1" fill="#43a047"/>
                            <!-- Ball -->
                            <circle cx="30" cy="40" r="3" fill="#fff"/>
                            <!-- Paddle -->
                            <rect x="14" y="49" width="20" height="4" rx="2" fill="#fff"/>
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
