const GAME_CONFIG = {
    id:           'memory',
    nameKey:      'game_memory_name',
    hasEndState:  true,
    scoringType:  'time',
};

const TUT_KEY  = 'hbp_tutorial_memory_seen';
const HS_KEY_4 = 'hbp_highscore_memory_4';
const HS_KEY_6 = 'hbp_highscore_memory_6';

const SYMBOLS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐙','🦋','🐬','🦄'];

let gridSize, totalPairs, hsKey;
let cards, flipped, moves, matchedPairs;
let startTime, timerInterval;
let lockBoard, gameStarted, gameEnded;

function getLang() {
    const m = document.cookie.match(/(?:^|;\s*)lang=(\w+)/);
    return (m && m[1] === 'en') ? 'en' : 'pl';
}

// ── Init (called by session.js) ───────────────────────────────────────────────
function initGame() {
    gridSize     = window.innerWidth >= 768 ? 6 : 4;
    totalPairs   = (gridSize * gridSize) / 2;
    hsKey        = gridSize === 6 ? HS_KEY_6 : HS_KEY_4;
    moves        = 0;
    matchedPairs = 0;
    flipped      = [];
    lockBoard    = false;
    gameStarted  = false;
    gameEnded    = false;

    if (localStorage.getItem(TUT_KEY)) {
        startGame();
    } else {
        buildGrid();
        updateStats();
        const tut = document.getElementById('memory-tutorial');
        if (tut) tut.classList.add('active');
    }
}

function startGame() {
    clearInterval(timerInterval);

    const newSize = window.innerWidth >= 768 ? 6 : 4;
    if (newSize !== gridSize) {
        gridSize   = newSize;
        totalPairs = (gridSize * gridSize) / 2;
        hsKey      = gridSize === 6 ? HS_KEY_6 : HS_KEY_4;
    }

    moves        = 0;
    matchedPairs = 0;
    startTime    = null;
    gameStarted  = false;
    gameEnded    = false;
    flipped      = [];
    lockBoard    = false;

    buildGrid();
    updateStats();
    updateHUD();

    const timerEl = document.getElementById('mem-timer');
    if (timerEl) timerEl.textContent = '0:00';

    const win = document.getElementById('memory-win');
    if (win) win.classList.add('hidden');
}

// ── Grid construction ─────────────────────────────────────────────────────────
function buildGrid() {
    const grid = document.getElementById('memory-grid');
    if (!grid) return;

    grid.className = 'memory-grid memory-grid--' + gridSize;

    const symbols = SYMBOLS.slice(0, totalPairs);
    const deck    = [...symbols, ...symbols];
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    cards = deck.map(function(sym, idx) {
        return { id: idx, symbol: sym, faceUp: false, matched: false, el: null };
    });

    grid.innerHTML = '';
    for (const card of cards) {
        const el = document.createElement('div');
        el.className = 'memory-card';
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.innerHTML =
            '<div class="memory-card-inner">' +
            '<div class="memory-card-back"><span aria-hidden="true">?</span></div>' +
            '<div class="memory-card-front"><span>' + card.symbol + '</span></div>' +
            '</div>';
        const c = card;
        el.addEventListener('click', function() { onCardClick(c); });
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(c); }
        });
        card.el = el;
        grid.appendChild(el);
    }
}

// ── Game logic ────────────────────────────────────────────────────────────────
function onCardClick(card) {
    if (lockBoard || card.faceUp || card.matched) return;
    if (flipped.length >= 2) return;

    if (!gameStarted) {
        gameStarted   = true;
        startTime     = Date.now();
        timerInterval = setInterval(tickTimer, 500);
    }

    card.faceUp = true;
    card.el.classList.add('is-flipped');
    flipped.push(card);

    if (flipped.length === 2) {
        moves++;
        updateStats();
        lockBoard = true;
        checkMatch();
    }
}

function checkMatch() {
    const a = flipped[0];
    const b = flipped[1];

    if (a.symbol === b.symbol) {
        a.el.classList.add('is-matched-flash');
        b.el.classList.add('is-matched-flash');
        setTimeout(function() {
            a.matched = b.matched = true;
            a.el.classList.remove('is-matched-flash');
            b.el.classList.remove('is-matched-flash');
            a.el.classList.add('is-matched');
            b.el.classList.add('is-matched');
            matchedPairs++;
            updateStats();
            flipped   = [];
            lockBoard = false;
            if (matchedPairs === totalPairs) gameWon();
        }, 500);
    } else {
        setTimeout(function() {
            a.faceUp = b.faceUp = false;
            a.el.classList.remove('is-flipped');
            b.el.classList.remove('is-flipped');
            flipped   = [];
            lockBoard = false;
        }, 1000);
    }
}

function gameWon() {
    clearInterval(timerInterval);
    gameEnded = true;

    const elapsedS  = Math.round((Date.now() - startTime) / 1000);
    const threshold = Math.ceil(totalPairs * 1.1);
    const bonus     = moves <= threshold;
    const score     = bonus ? Math.round(elapsedS * 0.8) : elapsedS;

    const prev  = parseInt(localStorage.getItem(hsKey) || '0', 10);
    const isNew = prev === 0 || score < prev;
    if (isNew) localStorage.setItem(hsKey, score);

    updateHUD();

    const fmt = function(s) {
        return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    };

    document.getElementById('mem-win-time').textContent  = fmt(elapsedS);
    document.getElementById('mem-win-moves').textContent = moves;
    document.getElementById('mem-win-score').textContent = fmt(score);
    document.getElementById('mem-win-best').textContent  = fmt(isNew ? score : Math.min(score, prev));

    const bonusEl = document.getElementById('mem-win-bonus');
    if (bonusEl) bonusEl.style.display = bonus ? '' : 'none';

    const win = document.getElementById('memory-win');
    if (win) win.classList.remove('hidden');
}

function tickTimer() {
    if (!gameStarted || gameEnded) return;
    const s  = Math.round((Date.now() - startTime) / 1000);
    const el = document.getElementById('mem-timer');
    if (el) el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function updateStats() {
    const movesEl = document.getElementById('mem-moves');
    const pairsEl = document.getElementById('mem-pairs');
    if (movesEl) movesEl.textContent = moves;
    if (pairsEl) pairsEl.textContent = totalPairs - matchedPairs;
}

function updateHUD() {
    const sc   = document.getElementById('session-score');
    const hs   = document.getElementById('high-score');
    const prev = parseInt(localStorage.getItem(hsKey) || '0', 10);
    if (sc) sc.textContent = moves;
    if (hs) hs.textContent = prev > 0 ? prev : '—';
}

// ── DOM events ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const btnStart = document.getElementById('btn-memory-start');
    if (btnStart) {
        btnStart.addEventListener('click', function() {
            localStorage.setItem(TUT_KEY, '1');
            const tut = document.getElementById('memory-tutorial');
            if (tut) tut.classList.remove('active');
            startGame();
        });
    }

    const btnWinRestart = document.getElementById('btn-memory-restart');
    if (btnWinRestart) btnWinRestart.addEventListener('click', startGame);

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) btnRestart.addEventListener('click', startGame);

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const newSize = window.innerWidth >= 768 ? 6 : 4;
            if (newSize !== gridSize) startGame();
        }, 250);
    });
});
