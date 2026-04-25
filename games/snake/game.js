const GAME_CONFIG = {
    id: 'snake',
    nameKey: 'game_snake_name',
    hasEndState: true,
    scoringType: 'count',
};

const GRID      = 20;
const SPD_START = 150;
const SPD_MIN   = 80;
const SPD_DEC   = 2;
const HS_KEY    = 'hbp_highscore_' + GAME_CONFIG.id;
const TUT_KEY   = 'hbp_tutorial_snake_seen';

const C_BG    = '#0a0a0a';
const C_GRID  = '#111111';
const C_SNAKE = '#00ff41';
const C_HEAD  = '#80ff80';
const C_APPLE = '#ff3333';

let canvas, ctx;
let snake, prevSnake, apple;
let dir     = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let score, highScore;
let speed;
let gameOver, gameOverTime;
let lastStepTime, rafId;
let restartBtnRect;
let touchSX = 0, touchSY = 0;

function cs() { return canvas.width / GRID; }

// ── State ─────────────────────────────────────────────────────────────────────

function resetState() {
    const m = Math.floor(GRID / 2);
    snake     = [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }];
    prevSnake = snake.map(s => ({ ...s }));
    dir = nextDir = { x: 1, y: 0 };
    score          = 0;
    speed          = SPD_START;
    gameOver       = false;
    gameOverTime   = 0;
    restartBtnRect = null;
    placeApple();
}

function placeApple() {
    const occ = new Set(snake.map(s => s.x + ',' + s.y));
    let x, y;
    do {
        x = Math.floor(Math.random() * GRID);
        y = Math.floor(Math.random() * GRID);
    } while (occ.has(x + ',' + y));
    apple = { x, y };
}

// ── Step ──────────────────────────────────────────────────────────────────────

function step() {
    dir       = nextDir;
    prevSnake = snake.map(s => ({ ...s }));

    const nx = ((snake[0].x + dir.x) + GRID) % GRID;
    const ny = ((snake[0].y + dir.y) + GRID) % GRID;

    // Exclude tail — it vacates its spot this tick
    if (snake.slice(0, -1).some(s => s.x === nx && s.y === ny)) {
        gameOver     = true;
        gameOverTime = performance.now();
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(HS_KEY, highScore);
        }
        return;
    }

    snake = [{ x: nx, y: ny }, ...snake];

    if (nx === apple.x && ny === apple.y) {
        score++;
        speed = Math.max(SPD_MIN, speed - SPD_DEC);
        placeApple();
        if (score > highScore) {
            highScore = score;
            localStorage.setItem(HS_KEY, highScore);
            showNewRecord();
        }
    } else {
        snake.pop();
    }

    updateHUD();
}

// ── Draw helpers ──────────────────────────────────────────────────────────────

function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
}

function lerpN(a, b, t) { return a + (b - a) * t; }

function lerpSeg(prev, next, t) {
    if (Math.abs(prev.x - next.x) > 1 || Math.abs(prev.y - next.y) > 1) return next;
    return { x: lerpN(prev.x, next.x, t), y: lerpN(prev.y, next.y, t) };
}

// ── Render ────────────────────────────────────────────────────────────────────

function drawBg() {
    const c = cs();
    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = C_GRID;
    ctx.lineWidth   = 0.5;
    for (let i = 1; i < GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i * c, 0);            ctx.lineTo(i * c, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * c);            ctx.lineTo(canvas.width, i * c);  ctx.stroke();
    }
}

function drawApple(ts) {
    const c     = cs();
    const pulse = 0.82 + 0.18 * Math.sin(ts * 0.003);
    ctx.shadowColor = C_APPLE;
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = C_APPLE;
    ctx.beginPath();
    ctx.arc(apple.x * c + c / 2, apple.y * c + c / 2, (c / 2 - 2) * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawSnake(t) {
    const c   = cs();
    const pad = Math.max(1, c * 0.08);
    const r   = Math.max(2, c * 0.22);
    for (let i = snake.length - 1; i >= 0; i--) {
        const pos    = lerpSeg(prevSnake[i] ?? snake[i], snake[i], t);
        const isHead = i === 0;
        ctx.fillStyle   = isHead ? C_HEAD : C_SNAKE;
        ctx.shadowColor = C_SNAKE;
        ctx.shadowBlur  = isHead ? 14 : 7;
        rrect(pos.x * c + pad, pos.y * c + pad, c - pad * 2, c - pad * 2, r);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

function drawGameOver(ts) {
    const w = canvas.width, h = canvas.height, c = cs();

    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, w, h);

    // Blinking title
    if (Math.floor((ts - gameOverTime) / 500) % 2 === 0) {
        ctx.shadowColor = C_SNAKE;
        ctx.shadowBlur  = 18;
        ctx.fillStyle   = C_SNAKE;
        ctx.font        = `bold ${Math.floor(c * 2.1)}px monospace`;
        ctx.textAlign   = 'center';
        ctx.fillText('GAME OVER', w / 2, h * 0.30);
    }

    ctx.shadowBlur = 0;
    ctx.fillStyle  = C_SNAKE;
    ctx.textAlign  = 'center';
    ctx.font       = `${Math.floor(c * 1.05)}px monospace`;
    ctx.fillText('SCORE: ' + score,     w / 2, h * 0.47);
    ctx.fillText('BEST:  ' + highScore, w / 2, h * 0.57);

    const bw = c * 9, bh = c * 2.2;
    const bx = (w - bw) / 2, by = h * 0.67;
    ctx.strokeStyle = C_SNAKE;
    ctx.lineWidth   = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle   = C_SNAKE;
    ctx.font        = `${Math.floor(c * 0.95)}px monospace`;
    ctx.fillText('[ RESTART ]', w / 2, by + bh * 0.67);
    restartBtnRect = { x: bx, y: by, w: bw, h: bh };
}

// ── Loop ──────────────────────────────────────────────────────────────────────

function loop(ts) {
    const elapsed = ts - lastStepTime;
    if (!gameOver && elapsed >= speed) {
        step();
        lastStepTime = ts;
    }
    const t = gameOver ? 1 : Math.min(elapsed / speed, 1);

    drawBg();
    drawApple(ts);
    drawSnake(t);
    if (gameOver) drawGameOver(ts);

    rafId = requestAnimationFrame(loop);
}

function startLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    lastStepTime = performance.now();
    rafId = requestAnimationFrame(loop);
}

// ── Public API ────────────────────────────────────────────────────────────────

function initGame() {
    canvas = document.getElementById('snake-canvas');
    ctx    = canvas.getContext('2d');
    const w    = canvas.offsetWidth || Math.min(window.innerWidth - 32, 400);
    canvas.width  = w;
    canvas.height = w;

    highScore = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    score = 0;
    updateHUD();

    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (localStorage.getItem(TUT_KEY)) {
        startSnake();
    } else {
        const ov = document.getElementById('snake-tutorial');
        if (ov) ov.style.display = 'flex';
    }
}

function startSnake() {
    resetState();
    updateHUD();
    startLoop();
}

function restartGame() {
    startSnake();
}

// ── HUD ───────────────────────────────────────────────────────────────────────

function updateHUD() {
    const sc = document.getElementById('session-score');
    if (sc) sc.textContent = score ?? 0;
    const hs = document.getElementById('high-score');
    if (hs) hs.textContent = highScore ?? 0;
}

function showNewRecord() {
    const b = document.getElementById('new-record-badge');
    if (!b) return;
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
    clearTimeout(b._t);
    b._t = setTimeout(() => b.classList.remove('show'), 2000);
}

// ── Keyboard ──────────────────────────────────────────────────────────────────

const KEY_DIR = {
    ArrowUp: {x:0,y:-1}, w:{x:0,y:-1}, W:{x:0,y:-1},
    ArrowDown: {x:0,y:1}, s:{x:0,y:1}, S:{x:0,y:1},
    ArrowLeft: {x:-1,y:0}, a:{x:-1,y:0}, A:{x:-1,y:0},
    ArrowRight: {x:1,y:0}, d:{x:1,y:0}, D:{x:1,y:0},
};

document.addEventListener('keydown', e => {
    if (gameOver) {
        if (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'r') {
            e.preventDefault();
            restartGame();
        }
        return;
    }
    const d = KEY_DIR[e.key];
    if (!d) return;
    e.preventDefault();
    if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
});

// ── Touch ─────────────────────────────────────────────────────────────────────

{
    const cvs = document.getElementById('snake-canvas');

    cvs?.addEventListener('touchstart', e => {
        touchSX = e.touches[0].clientX;
        touchSY = e.touches[0].clientY;
    }, { passive: true });

    cvs?.addEventListener('touchend', e => {
        if (gameOver) { restartGame(); return; }
        const dx = e.changedTouches[0].clientX - touchSX;
        const dy = e.changedTouches[0].clientY - touchSY;
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
        const d = Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? {x:1,y:0} : {x:-1,y:0})
            : (dy > 0 ? {x:0,y:1} : {x:0,y:-1});
        if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
    }, { passive: true });

    cvs?.addEventListener('click', e => {
        if (!gameOver || !restartBtnRect || !canvas) return;
        const rect = cvs.getBoundingClientRect();
        const sx   = canvas.width  / rect.width;
        const sy   = canvas.height / rect.height;
        const cx   = (e.clientX - rect.left) * sx;
        const cy   = (e.clientY - rect.top)  * sy;
        const b    = restartBtnRect;
        if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) restartGame();
    });
}

// ── Tutorial button ───────────────────────────────────────────────────────────

document.getElementById('btn-snake-start')?.addEventListener('click', () => {
    localStorage.setItem(TUT_KEY, '1');
    const ov = document.getElementById('snake-tutorial');
    if (ov) ov.style.display = 'none';
    startSnake();
});

// ── Restart button (HTML, not canvas) ────────────────────────────────────────

document.getElementById('btn-restart')?.addEventListener('click', restartGame);

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
    clearTimeout(window._snakeResizeT);
    window._snakeResizeT = setTimeout(() => {
        if (!canvas) return;
        const w = canvas.offsetWidth;
        canvas.width  = w;
        canvas.height = w;
    }, 120);
});
