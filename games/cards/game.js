// Collapse — 7x7 grid, tap a group of 3+ matching symbols, gravity
// Rate: 0.001 PLN per 10 seconds (handled by counter.js)

const GAME_CONFIG = {
    id:          'cards',
    nameKey:     'game_cards_name',
    hasEndState: false,
    scoringType: 'squared',
};

const GRID_SIZE     = 7;
const CANDY_TYPES   = 6;
const CANDY_SYMBOLS = ['♥', '♦', '♣', '♠', '★', '●'];
const HS_KEY        = 'hbp_highscore_' + GAME_CONFIG.id;

let grid                      = [];
let busy                      = false;
let touchOrigin               = null;
let sessionScore              = 0;
let newRecordShownThisSession = false;

// ---------- Init ----------

function initGame() {
    do {
        grid = buildRandomGrid();
    } while (!hasAnyGroup());
    renderGrid();
    updateScoreDisplay();
    updateHighScoreDisplay();
}

function restartGame() {
    busy         = false;
    touchOrigin  = null;
    sessionScore = 0;
    do {
        grid = buildRandomGrid();
    } while (!hasAnyGroup());
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

function markSelected(positions) {
    document.querySelectorAll('.candy').forEach(cell => {
        const key = cell.dataset.row + ',' + cell.dataset.col;
        if (positions.has(key)) cell.classList.add('selected');
    });
}

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
    handleTap(row, col);
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

    // Tap only — a swipe is ignored, there is nothing to swap in this game
    if (dist < 12) handleTap(touchOrigin.row, touchOrigin.col);

    touchOrigin = null;
}

// ---------- Shared tap logic ----------

function handleTap(row, col) {
    const group = findGroup(row, col);
    if (group.length < 3) return;

    busy = true;
    removeGroup(group).then(() => { busy = false; });
}

// ---------- Group removal ----------

async function removeGroup(group) {
    addScore(group.length);

    const removingKeys = new Set(group.map(({ row, col }) => row + ',' + col));

    markSelected(removingKeys);
    await wait(300);

    group.forEach(({ row, col }) => { grid[row][col] = -1; });

    await markRemoving(removingKeys);
    await wait(200);

    applyGravity();
    await renderGrid(removingKeys);
    await wait(300 + (GRID_SIZE - 1) * 25);

    // No group of 3+ left — deal a fresh board, the game never ends
    if (!hasAnyGroup()) {
        do {
            grid = buildRandomGrid();
        } while (!hasAnyGroup());
        await renderGrid();
    }
}

// ---------- Group detection ----------

// Flood fill: every cell of the same type connected (up/down/left/right) to (row, col)
function findGroup(row, col) {
    const type    = grid[row][col];
    const visited = new Set([row + ',' + col]);
    const queue   = [{ row, col }];
    const group   = [];

    while (queue.length > 0) {
        const cur = queue.shift();
        group.push(cur);

        const neighbours = [
            { row: cur.row - 1, col: cur.col },
            { row: cur.row + 1, col: cur.col },
            { row: cur.row,     col: cur.col - 1 },
            { row: cur.row,     col: cur.col + 1 },
        ];

        for (const n of neighbours) {
            const key = n.row + ',' + n.col;
            if (n.row < 0 || n.row >= GRID_SIZE || n.col < 0 || n.col >= GRID_SIZE) continue;
            if (visited.has(key)) continue;
            if (grid[n.row][n.col] !== type) continue;
            visited.add(key);
            queue.push(n);
        }
    }

    return group;
}

function hasAnyGroup() {
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (findGroup(r, c).length >= 3) return true;
        }
    }
    return false;
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

// ---------- Input wiring ----------

document.getElementById('btn-restart').addEventListener('click', restartGame);
