// Candy Crush — 7x7 grid, match-3, gravity, cascade
// Rate: 0.001 PLN per 10 seconds (handled by counter.js)

const GRID_SIZE     = 7;
const CANDY_TYPES   = 6;
const CANDY_SYMBOLS = ['♥', '♦', '♣', '♠', '★', '●'];
const HS_KEY        = 'hbp_highscore';

let grid                    = [];
let selected                = null;
let busy                    = false;
let touchOrigin             = null;
let sessionScore            = 0;
let newRecordShownThisSession = false;

// ---------- Init ----------

function initGame() {
    do {
        grid = buildRandomGrid();
    } while (findMatches().length > 0);
    renderGrid();
    updateScoreDisplay();
    updateHighScoreDisplay();
}

function restartGame() {
    selected     = null;
    busy         = false;
    touchOrigin  = null;
    sessionScore = 0;
    do {
        grid = buildRandomGrid();
    } while (findMatches().length > 0);
    renderGrid();
    updateScoreDisplay();
    updateHighScoreDisplay();
}

function buildRandomGrid() {
    return Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => randCandy())
    );
}

function randCandy() {
    return Math.floor(Math.random() * CANDY_TYPES);
}

// ---------- Score ----------

function addScore(tilesRemoved) {
    sessionScore += tilesRemoved * tilesRemoved;
    updateScoreDisplay();
    checkHighScore();
}

function updateScoreDisplay() {
    const el = document.getElementById('session-score');
    if (el) el.textContent = sessionScore;
}

function updateHighScoreDisplay() {
    const hs = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    const el = document.getElementById('high-score');
    if (el) el.textContent = hs;
}

function checkHighScore() {
    const hs = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    if (sessionScore > hs) {
        localStorage.setItem(HS_KEY, sessionScore);
        updateHighScoreDisplay();
        if (!newRecordShownThisSession) {
            newRecordShownThisSession = true;
            showNewRecord();
        }
    }
}

function showNewRecord() {
    const el = document.getElementById('new-record-badge');
    if (!el) return;
    el.classList.remove('new-record-show');
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add('new-record-show');
}

// ---------- Render ----------

function renderGrid(fallingCells = new Set()) {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            const container = document.getElementById('game-grid');
            if (!container) { resolve(); return; }

            const frag = document.createDocumentFragment();

            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const cell = document.createElement('button');
                    cell.className   = 'candy candy-' + grid[r][c];
                    cell.textContent = CANDY_SYMBOLS[grid[r][c]];
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.setAttribute('aria-label',
                        'candy ' + (grid[r][c] + 1) + ' row ' + (r + 1) + ' col ' + (c + 1));

                    if (selected && selected.row === r && selected.col === c) {
                        cell.classList.add('selected');
                    }

                    if (fallingCells.has(r + ',' + c)) {
                        cell.style.setProperty('--fall-delay', (r * 25) + 'ms');
                        cell.classList.add('candy-falling');
                    }

                    cell.addEventListener('click', () => onCellClick(r, c));
                    cell.addEventListener('touchstart', (e) => onTouchStart(e, r, c), { passive: false });
                    cell.addEventListener('touchend',   (e) => onTouchEnd(e, r, c),   { passive: true });

                    frag.appendChild(cell);
                }
            }

            container.innerHTML = '';
            container.appendChild(frag);
            resolve();
        });
    });
}

// ---------- Removal animation ----------

function markRemoving(positions) {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            document.querySelectorAll('.candy').forEach(cell => {
                const key = cell.dataset.row + ',' + cell.dataset.col;
                if (positions.has(key)) {
                    cell.style.setProperty('--tx',  (Math.random() * 80 - 40) + 'px');
                    cell.style.setProperty('--ty',  (Math.random() * 80 - 40) + 'px');
                    cell.style.setProperty('--rot', (Math.random() * 90 - 45) + 'deg');
                    cell.classList.add('candy-removing');
                }
            });
            resolve();
        });
    });
}

// ---------- Mouse input ----------

function onCellClick(row, col) {
    if (busy) return;
    handleSelect(row, col);
}

// ---------- Touch input ----------

function onTouchStart(e, row, col) {
    e.preventDefault(); // blocks synthetic click + scroll; touchend stays passive
    if (busy) return;
    touchOrigin = {
        row, col,
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
    };
}

function onTouchEnd(e, row, col) {
    if (busy || !touchOrigin) return;

    const dx   = e.changedTouches[0].clientX - touchOrigin.x;
    const dy   = e.changedTouches[0].clientY - touchOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 12) {
        handleSelect(touchOrigin.row, touchOrigin.col);
    } else {
        let targetRow = touchOrigin.row;
        let targetCol = touchOrigin.col;

        if (Math.abs(dx) > Math.abs(dy)) {
            targetCol += dx > 0 ? 1 : -1;
        } else {
            targetRow += dy > 0 ? 1 : -1;
        }

        if (
            targetRow >= 0 && targetRow < GRID_SIZE &&
            targetCol >= 0 && targetCol < GRID_SIZE
        ) {
            selected = null;
            busy = true;
            doSwap(touchOrigin.row, touchOrigin.col, targetRow, targetCol)
                .then(() => { busy = false; });
        }
    }

    touchOrigin = null;
}

// ---------- Shared select logic ----------

function handleSelect(row, col) {
    if (selected === null) {
        selected = { row, col };
        renderGrid();
        return;
    }

    if (selected.row === row && selected.col === col) {
        selected = null;
        renderGrid();
        return;
    }

    if (isAdjacent(selected.row, selected.col, row, col)) {
        const r1 = selected.row, c1 = selected.col;
        selected = null;
        busy = true;
        doSwap(r1, c1, row, col).then(() => { busy = false; });
    } else {
        selected = { row, col };
        renderGrid();
    }
}

function isAdjacent(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

// ---------- Swap & match ----------

async function doSwap(r1, c1, r2, c2) {
    swapCells(r1, c1, r2, c2);
    await renderGrid();

    if (findMatches().length === 0) {
        await wait(150);
        swapCells(r1, c1, r2, c2);
        await renderGrid();
        return;
    }

    await processMatchCascade();
}

function swapCells(r1, c1, r2, c2) {
    const tmp    = grid[r1][c1];
    grid[r1][c1] = grid[r2][c2];
    grid[r2][c2] = tmp;
}

async function processMatchCascade() {
    let matches = findMatches();
    while (matches.length > 0) {
        addScore(matches.length);

        const removingKeys = new Set(matches.map(({ row, col }) => row + ',' + col));
        matches.forEach(({ row, col }) => { grid[row][col] = -1; });

        await markRemoving(removingKeys);
        await wait(200);

        const fallingCells = new Set();
        for (let r = 0; r < GRID_SIZE; r++)
            for (let c = 0; c < GRID_SIZE; c++)
                if (grid[r][c] === -1) fallingCells.add(r + ',' + c);

        applyGravity();
        await renderGrid(fallingCells);
        await wait(300 + (GRID_SIZE - 1) * 25);

        matches = findMatches();
    }
}

// ---------- Match detection ----------

function findMatches() {
    const matched = new Set();

    for (let r = 0; r < GRID_SIZE; r++) {
        let run = 1;
        for (let c = 1; c <= GRID_SIZE; c++) {
            const same = c < GRID_SIZE && grid[r][c] !== -1 && grid[r][c] === grid[r][c - 1];
            if (same) {
                run++;
            } else {
                if (run >= 3) {
                    for (let k = c - run; k < c; k++) matched.add(r + ',' + k);
                }
                run = 1;
            }
        }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
        let run = 1;
        for (let r = 1; r <= GRID_SIZE; r++) {
            const same = r < GRID_SIZE && grid[r][c] !== -1 && grid[r][c] === grid[r - 1][c];
            if (same) {
                run++;
            } else {
                if (run >= 3) {
                    for (let k = r - run; k < r; k++) matched.add(k + ',' + c);
                }
                run = 1;
            }
        }
    }

    return Array.from(matched).map(s => {
        const [row, col] = s.split(',').map(Number);
        return { row, col };
    });
}

// ---------- Gravity ----------

function applyGravity() {
    for (let c = 0; c < GRID_SIZE; c++) {
        const filled = [];
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
            if (grid[r][c] !== -1) filled.push(grid[r][c]);
        }
        while (filled.length < GRID_SIZE) filled.push(randCandy());
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
            grid[r][c] = filled[GRID_SIZE - 1 - r];
        }
    }
}

// ---------- Utility ----------

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
