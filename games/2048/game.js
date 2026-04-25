const GAME_CONFIG = {
    id: '2048',
    nameKey: 'game_2048_name',
    hasEndState: true,
    scoringType: 'sum',
};

const BOARD_SIZE   = 4;
const BOARD_PAD    = 8;   // matches CSS padding
const TILE_GAP     = 8;   // gap between tiles (computed, no CSS gap needed)
const HS_KEY       = 'hbp_highscore_' + GAME_CONFIG.id;
const TUTORIAL_KEY = 'hbp_tutorial_2048_seen';

let board     = [];       // BOARD_SIZE × BOARD_SIZE of null | { id, value }
let tileEls   = new Map();// tile.id → DOM element
let score     = 0;
let highScore = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
let gameOver  = false;
let won       = false;
let animating = false;
let nextId    = 1;
let touchStartX = 0, touchStartY = 0;
let resizeTimer = null;

// ── Geometry ────────────────────────────────────────────────────────────────

function boardEl() { return document.getElementById('board-2048'); }

function cellSize() {
    const b = boardEl();
    if (!b) return 72;
    return (b.offsetWidth - 2 * BOARD_PAD - (BOARD_SIZE - 1) * TILE_GAP) / BOARD_SIZE;
}

function tilePos(r, c) {
    const cs = cellSize();
    return {
        top:  BOARD_PAD + r * (cs + TILE_GAP),
        left: BOARD_PAD + c * (cs + TILE_GAP),
        size: cs,
    };
}

function fontSize(val) {
    const cs  = cellSize();
    const len = String(val).length;
    const f   = len <= 2 ? 0.44 : len === 3 ? 0.34 : len === 4 ? 0.26 : 0.20;
    return Math.floor(cs * f) + 'px';
}

// ── Tile helpers ─────────────────────────────────────────────────────────────

function createTile(value) { return { id: nextId++, value }; }

function tileClass(val) {
    return val <= 2048 ? 'tile-' + val : 'tile-high';
}

function makeTileEl(tile, r, c, animate) {
    const { top, left, size } = tilePos(r, c);
    const el = document.createElement('div');
    el.className = 'board-tile ' + tileClass(tile.value) + (animate ? ' tile-new' : '');
    el.style.cssText = `top:${top}px;left:${left}px;width:${size}px;height:${size}px;font-size:${fontSize(tile.value)};`;
    el.textContent = tile.value;
    if (animate) el.addEventListener('animationend', () => el.classList.remove('tile-new'), { once: true });
    tileEls.set(tile.id, el);
    return el;
}

// ── Board setup ──────────────────────────────────────────────────────────────

function initBoardCells() {
    const b = boardEl();
    if (!b) return;
    b.querySelectorAll('.board-cell').forEach(el => el.remove());
    const cs = cellSize();
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const { top, left } = tilePos(r, c);
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.style.cssText = `top:${top}px;left:${left}px;width:${cs}px;height:${cs}px;`;
            b.appendChild(cell);
        }
    }
}

function repositionAllTiles() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const tile = board[r][c];
            if (!tile) continue;
            const el = tileEls.get(tile.id);
            if (!el) continue;
            const { top, left, size } = tilePos(r, c);
            el.style.transition = 'none';
            el.style.top        = top  + 'px';
            el.style.left       = left + 'px';
            el.style.width      = size + 'px';
            el.style.height     = size + 'px';
            el.style.fontSize   = fontSize(tile.value);
            requestAnimationFrame(() => { el.style.transition = ''; });
        }
    }
}

// ── Spawn ────────────────────────────────────────────────────────────────────

function spawnTile() {
    const empty = [];
    for (let r = 0; r < BOARD_SIZE; r++)
        for (let c = 0; c < BOARD_SIZE; c++)
            if (!board[r][c]) empty.push([r, c]);
    if (!empty.length) return null;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const tile = createTile(Math.random() < 0.9 ? 2 : 4);
    board[r][c] = tile;
    return { tile, r, c };
}

// ── Slide logic ───────────────────────────────────────────────────────────────

// Returns { newRow, moves: [{tile,origIdx,destIdx,mergedId?}], scoreGained }
function slideRow(row) {
    const items = row.map((t, i) => t ? { tile: t, origIdx: i } : null).filter(Boolean);
    const newRow = Array(BOARD_SIZE).fill(null);
    const moves  = [];
    let scoreGained = 0, dest = 0, i = 0;

    while (i < items.length) {
        if (i + 1 < items.length && items[i].tile.value === items[i + 1].tile.value) {
            const merged = createTile(items[i].tile.value * 2);
            scoreGained += merged.value;
            newRow[dest] = merged;
            moves.push({ tile: items[i].tile,     origIdx: items[i].origIdx,     destIdx: dest, mergedId: merged.id });
            moves.push({ tile: items[i + 1].tile, origIdx: items[i + 1].origIdx, destIdx: dest, mergedId: merged.id });
            i += 2;
        } else {
            newRow[dest] = items[i].tile;
            moves.push({ tile: items[i].tile, origIdx: items[i].origIdx, destIdx: dest });
            i++;
        }
        dest++;
    }
    return { newRow, moves, scoreGained };
}

// ── Directional moves ─────────────────────────────────────────────────────────

function moveLeft() {
    const allMoves = []; let totalScore = 0;
    const newBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    for (let r = 0; r < BOARD_SIZE; r++) {
        const { newRow, moves, scoreGained } = slideRow(board[r]);
        totalScore += scoreGained;
        newBoard[r] = newRow;
        moves.forEach(m => allMoves.push({ tileId: m.tile.id, fromR: r, fromC: m.origIdx, toR: r, toC: m.destIdx, mergedId: m.mergedId }));
    }
    return { allMoves, totalScore, newBoard };
}

function moveRight() {
    const allMoves = []; let totalScore = 0;
    const newBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    for (let r = 0; r < BOARD_SIZE; r++) {
        const { newRow, moves, scoreGained } = slideRow([...board[r]].reverse());
        totalScore += scoreGained;
        newBoard[r] = [...newRow].reverse();
        moves.forEach(m => allMoves.push({
            tileId: m.tile.id,
            fromR: r, fromC: BOARD_SIZE - 1 - m.origIdx,
            toR:   r, toC:   BOARD_SIZE - 1 - m.destIdx,
            mergedId: m.mergedId,
        }));
    }
    return { allMoves, totalScore, newBoard };
}

function moveUp() {
    const allMoves = []; let totalScore = 0;
    const newBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    for (let c = 0; c < BOARD_SIZE; c++) {
        const { newRow: newCol, moves, scoreGained } = slideRow(board.map(r => r[c]));
        totalScore += scoreGained;
        newCol.forEach((t, r) => { newBoard[r][c] = t; });
        moves.forEach(m => allMoves.push({ tileId: m.tile.id, fromR: m.origIdx, fromC: c, toR: m.destIdx, toC: c, mergedId: m.mergedId }));
    }
    return { allMoves, totalScore, newBoard };
}

function moveDown() {
    const allMoves = []; let totalScore = 0;
    const newBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    for (let c = 0; c < BOARD_SIZE; c++) {
        const { newRow: newCol, moves, scoreGained } = slideRow(board.map(r => r[c]).reverse());
        totalScore += scoreGained;
        [...newCol].reverse().forEach((t, r) => { newBoard[r][c] = t; });
        moves.forEach(m => allMoves.push({
            tileId: m.tile.id,
            fromR: BOARD_SIZE - 1 - m.origIdx, fromC: c,
            toR:   BOARD_SIZE - 1 - m.destIdx, toC:   c,
            mergedId: m.mergedId,
        }));
    }
    return { allMoves, totalScore, newBoard };
}

// ── Apply move with animation ─────────────────────────────────────────────────

function move(dir) {
    if (gameOver || animating) return;
    const fns = { left: moveLeft, right: moveRight, up: moveUp, down: moveDown };
    const { allMoves, totalScore, newBoard } = fns[dir]();

    // Nothing changed — bail early
    if (!allMoves.some(m => m.fromR !== m.toR || m.fromC !== m.toC)) return;

    animating = true;
    const b = boardEl();

    // Phase 1: slide tiles to new positions (CSS transition 100ms)
    allMoves.forEach(m => {
        const el = tileEls.get(m.tileId);
        if (!el) return;
        const { top, left } = tilePos(m.toR, m.toC);
        el.style.top    = top  + 'px';
        el.style.left   = left + 'px';
        el.style.zIndex = m.mergedId !== undefined ? '3' : '2';
    });

    // Phase 2: after transition, swap in merged tiles + spawn new tile
    setTimeout(() => {
        board = newBoard;

        // Remove source tiles that were merged
        allMoves.forEach(m => {
            if (m.mergedId === undefined) return;
            const el = tileEls.get(m.tileId);
            if (el) el.remove();
            tileEls.delete(m.tileId);
        });

        // Add merged result tiles (not yet in tileEls) with pop animation
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const tile = board[r][c];
                if (!tile || tileEls.has(tile.id)) continue;
                const { top, left, size } = tilePos(r, c);
                const el = document.createElement('div');
                el.className = 'board-tile ' + tileClass(tile.value) + ' tile-merged';
                el.style.cssText = `top:${top}px;left:${left}px;width:${size}px;height:${size}px;font-size:${fontSize(tile.value)};z-index:4;`;
                el.textContent = tile.value;
                el.addEventListener('animationend', () => { el.classList.remove('tile-merged'); el.style.zIndex = '2'; }, { once: true });
                tileEls.set(tile.id, el);
                b.appendChild(el);
            }
        }

        // Reset z-index on non-merged tiles
        allMoves.forEach(m => {
            if (m.mergedId !== undefined) return;
            const el = tileEls.get(m.tileId);
            if (el) el.style.zIndex = '2';
        });

        score += totalScore;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(HS_KEY, highScore);
            showNewRecord();
        }
        updateScoreDisplay();

        const spawned = spawnTile();
        if (spawned) b.appendChild(makeTileEl(spawned.tile, spawned.r, spawned.c, true));

        animating = false;

        if (!won && checkWin()) { won = true; showWinBadge(); }
        if (isGameOver()) { gameOver = true; setTimeout(showGameOver, 300); }
    }, 110);
}

// ── Win / game-over checks ────────────────────────────────────────────────────

function checkWin() {
    return board.some(r => r.some(t => t && t.value >= 2048));
}

function isGameOver() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!board[r][c]) return false;
            if (r + 1 < BOARD_SIZE && board[r][c].value === board[r + 1][c].value) return false;
            if (c + 1 < BOARD_SIZE && board[r][c].value === board[r][c + 1].value) return false;
        }
    }
    return true;
}

// ── UI feedback ───────────────────────────────────────────────────────────────

function updateScoreDisplay() {
    const sc = document.getElementById('session-score');
    if (sc) sc.textContent = score;
    const hs = document.getElementById('high-score');
    if (hs) hs.textContent = highScore;
}

function showGameOver() {
    const goScore = document.getElementById('gameover-score');
    if (goScore) goScore.textContent = score;
    const goEarned = document.getElementById('gameover-earned');
    if (goEarned && typeof getSessionEarned === 'function')
        goEarned.textContent = getSessionEarned().toFixed(4) + ' PLN';
    if (typeof showScreen === 'function') showScreen('screen-gameover');
}

function showWinBadge() {
    const badge = document.querySelector('.win-badge-2048');
    if (!badge) return;
    badge.classList.remove('win-badge-show');
    void badge.offsetWidth;
    badge.classList.add('win-badge-show');
}

function showNewRecord() {
    const badge = document.getElementById('new-record-badge');
    if (!badge) return;
    badge.classList.remove('show');
    void badge.offsetWidth;
    badge.classList.add('show');
    clearTimeout(badge._t);
    badge._t = setTimeout(() => badge.classList.remove('show'), 2000);
}

// ── Tutorial ──────────────────────────────────────────────────────────────────

function checkTutorial() {
    if (localStorage.getItem(TUTORIAL_KEY)) return;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'flex';
}

document.getElementById('btn-tutorial-ok')?.addEventListener('click', () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.display = 'none';
});

// ── Init / restart ────────────────────────────────────────────────────────────

function initGame() {
    board     = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    score     = 0;
    gameOver  = false;
    won       = false;
    animating = false;

    const b = boardEl();
    if (b) {
        tileEls.forEach(el => el.remove());
        tileEls.clear();
    }

    initBoardCells();
    spawnTile();
    spawnTile();

    if (b) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const tile = board[r][c];
                if (tile) b.appendChild(makeTileEl(tile, r, c, false));
            }
        }
    }

    updateScoreDisplay();
    checkTutorial();
}

function restartGame() {
    initGame();
    if (typeof showScreen === 'function') showScreen('screen-game');
}

// ── Input ─────────────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
    const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    if (!map[e.key]) return;
    e.preventDefault();
    move(map[e.key]);
});

const _boardEl = document.getElementById('board-2048');
if (_boardEl) {
    _boardEl.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    _boardEl.addEventListener('touchend', e => {
        if (document.getElementById('tutorial-overlay')?.style.display === 'flex') return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }, { passive: true });
}

document.getElementById('btn-restart')?.addEventListener('click', restartGame);

document.getElementById('btn-2048-play-again')?.addEventListener('click', () => {
    restartGame();
});

// ── Resize handler ────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        initBoardCells();
        repositionAllTiles();
    }, 120);
});
