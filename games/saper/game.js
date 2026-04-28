const GAME_CONFIG = {
    id: 'saper',
    nameKey: 'game_saper_name',
    hasEndState: true,
    scoringType: 'time'
};

const TUT_KEY = 'hbp_tutorial_saper_seen';

function getCfg() {
    return window.innerWidth < 768
        ? { rows: 9,  cols: 9,  mines: 10, hsKey: 'hbp_highscore_saper_9'  }
        : { rows: 16, cols: 16, mines: 40, hsKey: 'hbp_highscore_saper_16' };
}

let board, cfg, cellEls, gameState, timerSecs, timerInt, firstClick;

function initGame() {
    cfg        = getCfg();
    firstClick = true;
    gameState  = 'idle';
    timerSecs  = 0;
    clearInterval(timerInt);
    timerInt   = null;

    board   = [];
    cellEls = [];
    for (let r = 0; r < cfg.rows; r++) {
        board[r]   = [];
        cellEls[r] = [];
        for (let c = 0; c < cfg.cols; c++) {
            board[r][c] = { mine: false, revealed: false, flagged: false, adjacent: 0, isHit: false };
        }
    }

    renderBoard();
    setMineCounter(cfg.mines);
    setTimer(0);
    setHighScore();
    hideOverlay();
    checkTutorial();
}

// ── Board rendering ───────────────────────────────────────────────────────────

function renderBoard() {
    const el = document.getElementById('saper-board');
    el.innerHTML = '';
    el.style.gridTemplateColumns = 'repeat(' + cfg.cols + ', 1fr)';

    for (let r = 0; r < cfg.rows; r++) {
        for (let c = 0; c < cfg.cols; c++) {
            const div      = document.createElement('div');
            div.className  = 'saper-cell';
            div.dataset.r  = r;
            div.dataset.c  = c;
            el.appendChild(div);
            cellEls[r][c]  = div;
        }
    }
}

function updateCellEl(r, c, animate) {
    const el   = cellEls[r][c];
    const cell = board[r][c];
    el.className   = 'saper-cell';
    el.textContent = '';

    if (cell.revealed) {
        el.classList.add('revealed');
        if (cell.isHit) el.classList.add('mine-hit');
        if (cell.mine) {
            el.textContent = '💣';
        } else if (cell.adjacent > 0) {
            el.classList.add('num-' + cell.adjacent);
            el.textContent = cell.adjacent;
        }
        if (animate) {
            el.classList.add('just-revealed');
            setTimeout(function() { el.classList.remove('just-revealed'); }, 200);
        }
    } else if (cell.flagged) {
        el.classList.add('flagged');
        el.textContent = '🚩';
    }
}

// ── Mine placement ────────────────────────────────────────────────────────────

function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < cfg.mines) {
        const r = Math.floor(Math.random() * cfg.rows);
        const c = Math.floor(Math.random() * cfg.cols);
        if (!board[r][c].mine &&
            !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
            board[r][c].mine = true;
            placed++;
        }
    }
    for (let r = 0; r < cfg.rows; r++) {
        for (let c = 0; c < cfg.cols; c++) {
            if (!board[r][c].mine) board[r][c].adjacent = countAdj(r, c);
        }
    }
}

function countAdj(r, c) {
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < cfg.rows && nc >= 0 && nc < cfg.cols && board[nr][nc].mine) n++;
        }
    }
    return n;
}

// ── Game logic ────────────────────────────────────────────────────────────────

function reveal(r, c) {
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;
    if (gameState === 'won' || gameState === 'lost') return;

    if (firstClick) {
        firstClick = false;
        placeMines(r, c);
        startTimer();
        gameState = 'playing';
    }

    if (cell.mine) {
        cell.revealed = true;
        cell.isHit    = true;
        gameState     = 'lost';
        stopTimer();
        for (let rr = 0; rr < cfg.rows; rr++) {
            for (let cc = 0; cc < cfg.cols; cc++) {
                if (board[rr][cc].mine && !board[rr][cc].flagged) {
                    board[rr][cc].revealed = true;
                }
            }
        }
        for (let rr = 0; rr < cfg.rows; rr++) {
            for (let cc = 0; cc < cfg.cols; cc++) {
                if (board[rr][cc].mine) updateCellEl(rr, cc, false);
            }
        }
        setTimeout(function() { showOverlay('lose'); }, 600);
        return;
    }

    const newlyRevealed = [];
    floodReveal(r, c, newlyRevealed);
    for (let i = 0; i < newlyRevealed.length; i++) {
        updateCellEl(newlyRevealed[i][0], newlyRevealed[i][1], true);
    }
    checkWin();
}

function floodReveal(r, c, result) {
    if (r < 0 || r >= cfg.rows || c < 0 || c >= cfg.cols) return;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged || cell.mine) return;
    cell.revealed = true;
    result.push([r, c]);
    if (cell.adjacent === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr !== 0 || dc !== 0) floodReveal(r + dr, c + dc, result);
            }
        }
    }
}

function toggleFlag(r, c) {
    const cell = board[r][c];
    if (cell.revealed) return;
    if (gameState === 'won' || gameState === 'lost') return;
    cell.flagged = !cell.flagged;
    updateCellEl(r, c, false);
    let flagged = 0;
    for (let rr = 0; rr < cfg.rows; rr++)
        for (let cc = 0; cc < cfg.cols; cc++)
            if (board[rr][cc].flagged) flagged++;
    setMineCounter(cfg.mines - flagged);
}

function checkWin() {
    for (let r = 0; r < cfg.rows; r++) {
        for (let c = 0; c < cfg.cols; c++) {
            if (!board[r][c].mine && !board[r][c].revealed) return;
        }
    }
    gameState = 'won';
    stopTimer();
    for (let r = 0; r < cfg.rows; r++) {
        for (let c = 0; c < cfg.cols; c++) {
            if (board[r][c].mine && !board[r][c].flagged) {
                board[r][c].flagged = true;
                updateCellEl(r, c, false);
            }
        }
    }
    setMineCounter(0);
    saveBestTime();
    setTimeout(function() { showOverlay('win'); }, 600);
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function startTimer() {
    timerInt = setInterval(function() {
        timerSecs++;
        setTimer(timerSecs);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInt);
    timerInt = null;
}

function setTimer(secs) {
    const el = document.getElementById('saper-timer');
    if (el) el.textContent = fmtTime(secs);
}

function fmtTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ':' + String(s).padStart(2, '0');
}

// ── HUD ───────────────────────────────────────────────────────────────────────

function setMineCounter(n) {
    const el = document.getElementById('saper-mines');
    if (el) el.textContent = n;
}

function setHighScore() {
    const el  = document.getElementById('high-score');
    const raw = localStorage.getItem(cfg.hsKey);
    if (el) el.textContent = raw ? fmtTime(parseInt(raw, 10)) : '—';
}

function saveBestTime() {
    const prev = localStorage.getItem(cfg.hsKey);
    if (!prev || timerSecs < parseInt(prev, 10)) {
        localStorage.setItem(cfg.hsKey, timerSecs);
        const badge = document.getElementById('new-record-badge');
        if (badge) {
            badge.classList.add('new-record-show');
            setTimeout(function() { badge.classList.remove('new-record-show'); }, 3000);
        }
    }
    setHighScore();
}

// ── Overlays ──────────────────────────────────────────────────────────────────

function hideOverlay() {
    document.getElementById('saper-overlay').classList.add('hidden');
}

function showOverlay(type) {
    const tplId  = type === 'win' ? 'tpl-saper-win' : 'tpl-saper-lose';
    const tpl    = document.getElementById(tplId);
    const card   = document.querySelector('#saper-overlay .saper-result-card');
    const cloned = tpl.content.cloneNode(true);

    if (type === 'win') {
        const timeEl = cloned.querySelector('[data-time]');
        const bestEl = cloned.querySelector('[data-best]');
        if (timeEl) timeEl.textContent = fmtTime(timerSecs);
        if (bestEl) {
            const best = localStorage.getItem(cfg.hsKey);
            bestEl.textContent = best ? fmtTime(parseInt(best, 10)) : fmtTime(timerSecs);
        }
    }

    card.innerHTML = '';
    card.appendChild(cloned);
    card.querySelector('[data-action="restart"]')
        ?.addEventListener('click', initGame);

    document.getElementById('saper-overlay').classList.remove('hidden');
}

// ── Tutorial ──────────────────────────────────────────────────────────────────

function checkTutorial() {
    if (!localStorage.getItem(TUT_KEY)) {
        document.getElementById('saper-tutorial').classList.add('active');
    }
}

// ── Events ────────────────────────────────────────────────────────────────────

function setupEvents() {
    const el = document.getElementById('saper-board');

    let longTimer = null;
    let longFired = false;
    let touchR = -1, touchC = -1;

    el.addEventListener('click', function(e) {
        if (longFired) { longFired = false; return; }
        const cell = e.target.closest('.saper-cell');
        if (!cell) return;
        reveal(+cell.dataset.r, +cell.dataset.c);
    });

    el.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const cell = e.target.closest('.saper-cell');
        if (!cell) return;
        toggleFlag(+cell.dataset.r, +cell.dataset.c);
    });

    el.addEventListener('touchstart', function(e) {
        const cell = e.target.closest('.saper-cell');
        if (!cell) return;
        longFired = false;
        touchR = +cell.dataset.r;
        touchC = +cell.dataset.c;
        longTimer = setTimeout(function() {
            longFired = true;
            toggleFlag(touchR, touchC);
        }, 500);
    }, { passive: true });

    el.addEventListener('touchend', function() {
        clearTimeout(longTimer);
    }, { passive: true });

    el.addEventListener('touchmove', function() {
        clearTimeout(longTimer);
        longFired = true;
    }, { passive: true });

    document.getElementById('btn-saper-start').addEventListener('click', function() {
        localStorage.setItem(TUT_KEY, '1');
        document.getElementById('saper-tutorial').classList.remove('active');
    });

    document.getElementById('btn-restart').addEventListener('click', initGame);
}

document.addEventListener('DOMContentLoaded', setupEvents);
