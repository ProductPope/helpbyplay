<?php
// Shared page layout — render_header() and render_footer().
// Requires config.php and lang.php loaded before calling.

function render_header(
    string $pageTitle,
    string $bodyClass,
    int    $totalSessions,
    float  $totalPln,
    string $lang,
    string $extraCssHref    = '',
    int    $extraCssVersion = 0
): void {
    $sharedCssVer = filemtime(__DIR__ . '/assets/shared.css');
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/shared/assets/shared.css?v=<?= $sharedCssVer ?>">
<?php if ($extraCssHref !== ''): ?>
    <link rel="stylesheet" href="<?= htmlspecialchars($extraCssHref) ?>?v=<?= $extraCssVersion ?>">
<?php endif; ?>
<?php if (defined('ADSENSE_CLIENT') && ADSENSE_CLIENT !== ''): ?>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?= htmlspecialchars(ADSENSE_CLIENT) ?>" crossorigin="anonymous"></script>
<?php endif; ?>
</head>
<body class="<?= htmlspecialchars($bodyClass) ?>">

    <header class="site-header">
        <div class="container">
            <a href="/index.php" class="header-home">Help By <span class="logo-play">Play</span></a>
            <a href="/statystyki.php" class="header-nav-link"><?= t('nav_stats') ?></a>
            <a href="/statystyki.php" class="header-stats">👤 <?= number_format($totalSessions, 0, ',', ' ') ?> · <?= number_format($totalPln, 4, ',', ' ') ?> <?= t('currency') ?></a>
        </div>
    </header>

    <main class="container">
<?php
}

function game_thumbnail_svg(string $key, int $size = 44): string {
    $w = $size; $h = $size;
    switch ($key) {
        case 'cards':
            return '<svg viewBox="0 0 60 60" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="7" y="27" font-size="22" fill="#E53935">♥</text><text x="31" y="27" font-size="22" fill="#1565C0">♦</text><text x="7" y="54" font-size="22" fill="#0D1117">♣</text><text x="31" y="54" font-size="22" fill="#0D1117">♠</text></svg>';
        case '2048':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="56" height="56" rx="4" fill="#BBADA0"/><rect x="3" y="3" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="17" y="3" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="31" y="3" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="45" y="3" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="3" y="17" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="17" y="17" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="31" y="17" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="45" y="17" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="3" y="31" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="17" y="31" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="31" y="31" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="45" y="31" width="11" height="11" rx="2" fill="rgba(238,228,218,0.35)"/><rect x="3" y="45" width="11" height="11" rx="2" fill="#FFF9F0"/><text x="8" y="53.5" text-anchor="middle" font-size="6" font-weight="700" fill="#776E65">2</text><rect x="17" y="45" width="11" height="11" rx="2" fill="#FFF3DC"/><text x="22" y="53.5" text-anchor="middle" font-size="6" font-weight="700" fill="#776E65">4</text><rect x="31" y="45" width="11" height="11" rx="2" fill="#FFBA73"/><text x="36" y="53.5" text-anchor="middle" font-size="6" font-weight="700" fill="#F9F6F2">8</text><rect x="45" y="45" width="11" height="11" rx="2" fill="#F9A04E"/><text x="50" y="53.5" text-anchor="middle" font-size="5" font-weight="700" fill="#F9F6F2">16</text></svg>';
        case 'snake':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="56" height="56" rx="4" fill="#0a0a0a"/><rect x="5" y="16" width="9" height="9" rx="2" fill="#00ff41"/><rect x="16" y="16" width="9" height="9" rx="2" fill="#00ff41"/><rect x="27" y="16" width="9" height="9" rx="2" fill="#00ff41"/><rect x="27" y="27" width="9" height="9" rx="2" fill="#00ff41"/><rect x="27" y="38" width="9" height="9" rx="2" fill="#80ff80"/><circle cx="44" cy="27" r="5" fill="#ff3333"/></svg>';
        case 'saper':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="56" height="56" rx="4" fill="#bdbdbd"/><rect x="2" y="2" width="12" height="12" rx="1" fill="#c0c0c0"/><rect x="15" y="2" width="12" height="12" rx="1" fill="#c0c0c0"/><rect x="28" y="2" width="12" height="12" rx="1" fill="#c0c0c0"/><rect x="2" y="15" width="12" height="12" rx="1" fill="#c0c0c0"/><rect x="15" y="15" width="12" height="12" rx="1" fill="#c0c0c0"/><rect x="2" y="28" width="12" height="12" rx="1" fill="#c0c0c0"/><text x="8" y="12" text-anchor="middle" font-size="9" font-weight="700" fill="#1565C0" font-family="monospace">1</text><text x="21" y="12" text-anchor="middle" font-size="9" font-weight="700" fill="#388E3C" font-family="monospace">2</text><text x="34" y="12" text-anchor="middle" font-size="9" font-weight="700" fill="#C62828" font-family="monospace">3</text><rect x="41" y="2" width="12" height="12" rx="1" fill="#d0d0cc"/><rect x="28" y="15" width="12" height="12" rx="1" fill="#d0d0cc"/><rect x="41" y="15" width="12" height="12" rx="1" fill="#d0d0cc"/><rect x="41" y="15" width="12" height="12" rx="1" fill="#d0d0cc"/><rect x="47" y="17" width="1.5" height="9" rx="0.5" fill="#444"/><polygon points="48.5,17 48.5,22 43,19.5" fill="#e53935"/></svg>';
        case 'platformer':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="56" height="56" rx="4" fill="#5c94fc"/><rect x="0" y="46" width="56" height="10" fill="#5aa02c"/><rect x="0" y="51" width="56" height="5" fill="#8b5e00"/><rect x="6" y="30" width="26" height="8" fill="#5aa02c"/><rect x="6" y="35" width="26" height="3" fill="#8b5e00"/><circle cx="44" cy="22" r="6" fill="#ee2222"/><circle cx="42" cy="20" r="2" fill="rgba(255,255,255,0.35)"/><circle cx="44" cy="38" r="5" fill="#22aa22"/><rect x="9" y="22" width="12" height="10" fill="#f0f8ff"/><rect x="9" y="16" width="12" height="7" fill="#ffffff"/><rect x="13" y="17" width="4" height="2" fill="#dd2222"/><rect x="14" y="15" width="2" height="6" fill="#dd2222"/></svg>';
        case 'jumper':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="jsky'.$size.'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a2a6a"/><stop offset="100%" stop-color="#3a78d4"/></linearGradient></defs><rect width="56" height="56" rx="4" fill="url(#jsky'.$size.')"/><rect x="4" y="46" width="24" height="5" rx="2" fill="#5aa02c"/><rect x="28" y="32" width="18" height="5" rx="2" fill="#f8d800"/><rect x="35" y="26" width="4" height="6" rx="1" fill="#cc8800"/><rect x="32" y="24" width="10" height="3" rx="1" fill="#cc8800"/><rect x="8" y="18" width="22" height="5" rx="2" fill="#7744cc"/><rect x="12" y="6" width="8" height="12" rx="1" fill="#fff"/><rect x="13" y="5" width="6" height="6" rx="1" fill="#ffcc88"/></svg>';
        case 'invaders':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="56" height="56" rx="4" fill="#000"/><rect x="22" y="4" width="12" height="4" rx="2" fill="#ff2222"/><rect x="18" y="7" width="20" height="5" rx="2" fill="#ff2222"/><rect x="4" y="16" width="8" height="6" rx="1" fill="#33ff33"/><rect x="16" y="16" width="8" height="6" rx="1" fill="#33ff33"/><rect x="28" y="16" width="8" height="6" rx="1" fill="#33ff33"/><rect x="40" y="16" width="8" height="6" rx="1" fill="#33ff33"/><rect x="4" y="25" width="8" height="6" rx="1" fill="#33ff33"/><rect x="16" y="25" width="8" height="6" rx="1" fill="#33ff33"/><rect x="28" y="25" width="8" height="6" rx="1" fill="#33ff33"/><rect x="40" y="25" width="8" height="6" rx="1" fill="#33ff33"/><rect x="4" y="40" width="8" height="5" fill="#228822"/><rect x="16" y="40" width="8" height="5" fill="#228822"/><rect x="32" y="40" width="8" height="5" fill="#228822"/><rect x="44" y="40" width="8" height="5" fill="#228822"/><rect x="23" y="49" width="10" height="4" rx="1" fill="#33ff33"/><rect x="26" y="46" width="4" height="5" rx="1" fill="#33ff33"/></svg>';
        case 'memory':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="56" height="56" rx="4" fill="#12123a"/><rect x="3" y="3" width="11" height="11" rx="2" fill="#1565C0"/><rect x="16" y="3" width="11" height="11" rx="2" fill="#fff"/><circle cx="21.5" cy="8.5" r="3.5" fill="#ff9800"/><circle cx="19" cy="5.5" r="1.2" fill="#ff9800"/><circle cx="24" cy="5.5" r="1.2" fill="#ff9800"/><rect x="29" y="3" width="11" height="11" rx="2" fill="#1565C0"/><rect x="42" y="3" width="11" height="11" rx="2" fill="#fff" stroke="#4CAF50" stroke-width="1.5"/><circle cx="47.5" cy="8.5" r="3.5" fill="#ff9800"/><circle cx="45" cy="5.5" r="1.2" fill="#ff9800"/><circle cx="50" cy="5.5" r="1.2" fill="#ff9800"/><rect x="3" y="16" width="11" height="11" rx="2" fill="#fff"/><circle cx="8.5" cy="21.5" r="3.5" fill="#9c27b0"/><circle cx="6" cy="18.5" r="1.2" fill="#9c27b0"/><circle cx="11" cy="18.5" r="1.2" fill="#9c27b0"/><rect x="16" y="16" width="11" height="11" rx="2" fill="#1565C0"/><rect x="29" y="16" width="11" height="11" rx="2" fill="#fff" stroke="#4CAF50" stroke-width="1.5"/><circle cx="34.5" cy="21.5" r="3.5" fill="#9c27b0"/><circle cx="32" cy="18.5" r="1.2" fill="#9c27b0"/><circle cx="37" cy="18.5" r="1.2" fill="#9c27b0"/><rect x="42" y="16" width="11" height="11" rx="2" fill="#1565C0"/><rect x="3" y="29" width="11" height="11" rx="2" fill="#1565C0"/><rect x="16" y="29" width="11" height="11" rx="2" fill="#1565C0"/><rect x="29" y="29" width="11" height="11" rx="2" fill="#1565C0"/><rect x="42" y="29" width="11" height="11" rx="2" fill="#1565C0"/></svg>';
        case 'bricks':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="56" height="56" rx="4" fill="#000"/><rect x="2" y="8" width="10" height="5" rx="1" fill="#e53935"/><rect x="14" y="8" width="10" height="5" rx="1" fill="#e53935"/><rect x="26" y="8" width="10" height="5" rx="1" fill="#e53935"/><rect x="38" y="8" width="10" height="5" rx="1" fill="#e53935"/><rect x="2" y="15" width="10" height="5" rx="1" fill="#fb8c00"/><rect x="14" y="15" width="10" height="5" rx="1" fill="#fb8c00"/><rect x="26" y="15" width="10" height="5" rx="1" fill="#fb8c00"/><rect x="38" y="15" width="10" height="5" rx="1" fill="#fb8c00"/><rect x="2" y="22" width="10" height="5" rx="1" fill="#fdd835"/><rect x="14" y="22" width="10" height="5" rx="1" fill="#fdd835"/><rect x="26" y="22" width="10" height="5" rx="1" fill="#fdd835"/><rect x="38" y="22" width="10" height="5" rx="1" fill="#fdd835"/><rect x="2" y="29" width="10" height="5" rx="1" fill="#43a047"/><rect x="14" y="29" width="10" height="5" rx="1" fill="#43a047"/><rect x="26" y="29" width="10" height="5" rx="1" fill="#43a047"/><rect x="38" y="29" width="10" height="5" rx="1" fill="#43a047"/><circle cx="30" cy="40" r="3" fill="#fff"/><rect x="14" y="49" width="20" height="4" rx="2" fill="#fff"/></svg>';
        case 'runner':
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="56" height="56" rx="4" fill="#1a1a2e"/><circle cx="8" cy="6" r="1" fill="rgba(255,255,255,0.6)"/><circle cx="22" cy="4" r="0.7" fill="rgba(255,255,255,0.5)"/><circle cx="38" cy="9" r="1.1" fill="rgba(255,255,255,0.7)"/><circle cx="50" cy="5" r="0.6" fill="rgba(255,255,255,0.4)"/><rect x="0" y="44" width="56" height="12" fill="#0e2a50"/><rect x="0" y="44" width="56" height="2" fill="#1c4a7a"/><rect x="38" y="26" width="14" height="18" rx="2" fill="#c0392b"/><rect x="36" y="26" width="18" height="4" rx="1" fill="#e74c3c"/><rect x="10" y="20" width="14" height="18" rx="3" fill="#39ff14"/><circle cx="21" cy="26" r="2" fill="#1a1a2e"/></svg>';
        default:
            return '<svg viewBox="0 0 56 56" width="'.$w.'" height="'.$h.'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="28" cy="28" r="22" fill="#E2E8F0"/><text x="28" y="35" text-anchor="middle" font-size="22" font-weight="700" fill="#9CA3AF">?</text></svg>';
    }
}

function render_below_game(string $game_id = ''): void {
    $all_games = ['cards', '2048', 'snake', 'saper', 'platformer', 'jumper', 'invaders', 'memory', 'bricks', 'runner'];
    $other_games = array_filter($all_games, fn($key) => $key !== $game_id);
?>
<?php if ($game_id !== ''): ?>
    <section class="game-info">
        <h2><?= htmlspecialchars(t('game_' . $game_id . '_name')) ?></h2>
        <p><?= htmlspecialchars(t('game_' . $game_id . '_about')) ?></p>
        <h3><?= htmlspecialchars(t('how_to_play')) ?></h3>
        <p><?= htmlspecialchars(t('game_' . $game_id . '_tutorial')) ?></p>

        <h3 class="other-games-heading"><?= htmlspecialchars(t('other_games')) ?></h3>
        <div class="other-games-wrap">
            <button class="other-games-arrow other-games-arrow--prev" aria-label="Poprzednia">&#8249;</button>
            <div class="other-games-scroll" id="other-games-scroll">
<?php foreach ($other_games as $key): ?>
                <a href="/games/<?= htmlspecialchars($key) ?>/" class="other-games-tile">
                    <div class="other-games-tile-thumb"><?= game_thumbnail_svg($key) ?></div>
                    <span class="other-games-tile-name"><?= htmlspecialchars(t('game_' . $key . '_name')) ?></span>
                </a>
<?php endforeach; ?>
            </div>
            <button class="other-games-arrow other-games-arrow--next" aria-label="Następna">&#8250;</button>
        </div>
        <script>
        (function(){
            var wrap=document.querySelector('.other-games-wrap');
            if(!wrap)return;
            var sc=wrap.querySelector('.other-games-scroll');
            var prev=wrap.querySelector('.other-games-arrow--prev');
            var next=wrap.querySelector('.other-games-arrow--next');
            if(sc.scrollWidth<=sc.clientWidth+2){return;}
            prev.style.display='flex';next.style.display='flex';
            function upd(){
                prev.disabled=sc.scrollLeft<=0;
                next.disabled=sc.scrollLeft>=sc.scrollWidth-sc.clientWidth-2;
            }
            prev.addEventListener('click',function(){sc.scrollBy({left:-192,behavior:'smooth'});});
            next.addEventListener('click',function(){sc.scrollBy({left:192,behavior:'smooth'});});
            sc.addEventListener('scroll',upd,{passive:true});
            upd();
        })();
        </script>
    </section>
<?php endif; ?>

    <section class="game-info-card">
        <h2><?= htmlspecialchars(t('playing_for')) ?> <?= htmlspecialchars(FOUNDATION_NAME) ?></h2>
        <p><?= htmlspecialchars(FOUNDATION_DESC) ?></p>
    </section>

    <section class="game-info-card">
        <h2><?= htmlspecialchars(t('recommend_title')) ?></h2>
        <p><?= htmlspecialchars(t('recommend_text')) ?></p>
        <a href="https://helpbyplay.com" target="_blank" rel="noopener noreferrer"><?= htmlspecialchars(t('recommend_link')) ?></a>
    </section>
<?php
}

function render_footer(string $lang): void {
?>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p class="footer-opensource">
                <?= t('footer_opensource') ?>
                <a href="https://helpbyplay.com" target="_blank" rel="noopener"><?= t('footer_about_link') ?></a>
                &middot;
                <a href="https://github.com/ProductPope/helpbyplay" target="_blank" rel="noopener">GitHub</a>
                &middot;
                <a href="/statystyki.php"><?= t('nav_stats') ?></a>
                &middot;
                <a href="https://helpbyplay.com/polityka-prywatnosci.html" target="_blank" rel="noopener"><?= t('privacy_policy') ?></a>
            </p>
            <div class="lang-switcher">
                <button onclick="switchLang('pl')" class="<?= $lang === 'pl' ? 'active' : '' ?>"><?= t('lang_pl') ?></button>
                <button onclick="switchLang('en')" class="<?= $lang === 'en' ? 'active' : '' ?>"><?= t('lang_en') ?></button>
            </div>
        </div>
    </footer>
    <script>window.HBP_CONSENT_STRINGS={text:<?= json_encode(t('cookie_consent_text')) ?>,accept:<?= json_encode(t('cookie_accept')) ?>,decline:<?= json_encode(t('cookie_decline')) ?>};</script>
    <script src="/shared/assets/cookie-consent.js?v=<?= @filemtime(__DIR__ . '/assets/cookie-consent.js') ?>"></script>
<?php
}
