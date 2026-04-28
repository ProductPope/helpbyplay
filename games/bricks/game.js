const GAME_CONFIG = {
    id:          'bricks',
    nameKey:     'game_bricks_name',
    hasEndState: true,
    scoringType: 'sum',
};

const TUT_KEY = 'hbp_tutorial_bricks_seen';
const HS_KEY  = 'hbp_highscore_bricks';

// ── Canvas logical size ───────────────────────────────────────────────────────
const CW = 400;
const CH = 560;

// ── Layout ────────────────────────────────────────────────────────────────────
const HUD_H         = 44;
const BRICK_TOP     = HUD_H + 8;
const BRICK_COLS    = 8;
const BRICK_ROWS_BASE = 5;
const BRICK_ROWS_MAX  = 10;
const BRICK_PAD_X   = 10;
const BRICK_GAP_X   = 5;
const BRICK_GAP_Y   = 6;
const BRICK_H       = 16;
const PAD_H         = 12;
const PAD_Y         = CH - 72;
const PAD_W_BASE    = 80;
const PAD_W_WIDE    = 120;
const PAD_SPEED     = 7;
const BALL_R        = 7;
const PU_W          = 36;
const PU_H          = 20;
const PU_SPD        = 1.6;
const PU_INTERVAL   = 15;

// ── Brick row definitions ─────────────────────────────────────────────────────
const ROW_DEFS = [
    { color: '#E53935', pts: 30 },
    { color: '#FB8C00', pts: 25 },
    { color: '#FDD835', pts: 20 },
    { color: '#43A047', pts: 15 },
    { color: '#1E88E5', pts: 10 },
    { color: '#AB47BC', pts: 10 },
    { color: '#26C6DA', pts: 10 },
    { color: '#FF7043', pts: 10 },
    { color: '#78909C', pts: 10 },
    { color: '#8D6E63', pts: 10 },
];

// ── Physics ───────────────────────────────────────────────────────────────────
const SPEED_BASE = 4.2;   // px per frame at 60fps
const SPEED_INC  = 0.05;  // 5% per level
const MIN_ANGLE  = 15 * Math.PI / 180;

// ── Power-up types ────────────────────────────────────────────────────────────
const PU_WIDE     = 'wide';
const PU_SLOW     = 'slow';
const PU_LIFE     = 'life';
const PU_WIDE_DUR = 10000;
const PU_SLOW_DUR = 8000;

// ── State ─────────────────────────────────────────────────────────────────────
let canvas, ctx, brickW;
let paddle, ball, bricks, particles, powerups;
let lives, level, score, highScore;
let ballOnPaddle, gameState;
let animFrame, lastTime;
let bricksDestroyed;
let puWideEnd, puSlowEnd;
let levelClearTime, levelClearCountdown;

// Input
let mouseX    = CW / 2;
let touchX    = null;
let keysLeft  = false;
let keysRight = false;

function getLang() {
    const m = document.cookie.match(/(?:^|;\s*)lang=(\w+)/);
    return (m && m[1] === 'en') ? 'en' : 'pl';
}

// ── Init (called by session.js) ───────────────────────────────────────────────
function initGame() {
    canvas        = document.getElementById('bricks-canvas');
    ctx           = canvas.getContext('2d');
    canvas.width  = CW;
    canvas.height = CH;
    brickW        = (CW - 2 * BRICK_PAD_X - (BRICK_COLS - 1) * BRICK_GAP_X) / BRICK_COLS;
    highScore     = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    particles     = [];
    score         = 0;
    lives         = 3;
    level         = 1;

    setupInputHandlers();
    updateHUDDisplay();

    if (localStorage.getItem(TUT_KEY)) {
        startNewGame();
    } else {
        showTutorial();
    }
}

function showTutorial() {
    gameState = 'tutorial';
    level     = 1;
    setupLevel();
    gameState = 'tutorial';   // override 'ready' set by setupLevel
    drawFrame();
    const tut = document.getElementById('bricks-tutorial');
    if (tut) tut.classList.add('active');

    const btnStart = document.getElementById('btn-bricks-start');
    if (btnStart) {
        btnStart.onclick = function() {
            console.log('[Bricks] START clicked');
            localStorage.setItem(TUT_KEY, '1');
            startNewGame();
        };
    }
}

function startNewGame() {
    lives          = 3;
    level          = 1;
    score          = 0;
    bricksDestroyed = 0;
    puWideEnd      = 0;
    puSlowEnd      = 0;
    particles      = [];
    hideAllOverlays();
    setupLevel();
    startLoop();
}

function setupLevel() {
    const rows = Math.min(BRICK_ROWS_BASE + level - 1, BRICK_ROWS_MAX);
    bricks   = buildBricks(rows);
    powerups = [];

    const now  = Date.now();
    const padW = (now < puWideEnd) ? PAD_W_WIDE : PAD_W_BASE;
    paddle = { x: (CW - padW) / 2, y: PAD_Y, w: padW, h: PAD_H };

    resetBall();
    gameState = 'ready';
}

function buildBricks(rows) {
    const result = [];
    for (let r = 0; r < rows; r++) {
        const def = ROW_DEFS[r] || ROW_DEFS[ROW_DEFS.length - 1];
        for (let c = 0; c < BRICK_COLS; c++) {
            const armored = Math.random() < 0.10;
            result.push({
                x:       BRICK_PAD_X + c * (brickW + BRICK_GAP_X),
                y:       BRICK_TOP   + r * (BRICK_H  + BRICK_GAP_Y),
                w:       brickW,
                h:       BRICK_H,
                color:   def.color,
                pts:     def.pts,
                armored: armored,
                hits:    armored ? 2 : 1,
                alive:   true,
            });
        }
    }
    return result;
}

function resetBall() {
    ball = {
        x: paddle.x + paddle.w / 2,
        y: PAD_Y - BALL_R - 1,
        vx: 0,
        vy: 0,
    };
    ballOnPaddle = true;
}

// ── Loop ──────────────────────────────────────────────────────────────────────
function startLoop() {
    if (animFrame) cancelAnimationFrame(animFrame);
    lastTime   = null;
    animFrame  = requestAnimationFrame(loop);
}

function stopLoop() {
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = null;
}

function loop(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / (1000 / 60), 3);
    lastTime = ts;

    update(dt, ts);
    drawFrame();

    if (gameState !== 'game_over') {
        animFrame = requestAnimationFrame(loop);
    }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt, now) {
    if (gameState === 'ready') {
        movePaddle(dt);
        ball.x = paddle.x + paddle.w / 2;
        ball.y = PAD_Y - BALL_R - 1;
    }

    if (gameState === 'playing') {
        movePaddle(dt);
        moveBall(dt, now);
        movePoweups(dt, now);
        tickParticles(dt);
        checkPowerupExpiry(now);
    }

    if (gameState === 'level_clear') {
        tickParticles(dt);
        const elapsed   = now - levelClearTime;
        const remaining = Math.ceil(Math.max(0, 3000 - elapsed) / 1000);
        if (remaining !== levelClearCountdown) {
            levelClearCountdown = remaining;
            const el = document.getElementById('bricks-countdown');
            if (el) el.textContent = remaining > 0 ? String(remaining) : '';
        }
        if (elapsed >= 3000) {
            level++;
            hideAllOverlays();
            setupLevel();
            startLoop();
        }
    }
}

function movePaddle(dt) {
    let tx = paddle.x;
    if (touchX !== null) {
        tx = touchX - paddle.w / 2;
    } else if (keysLeft || keysRight) {
        if (keysLeft)  tx -= PAD_SPEED * dt;
        if (keysRight) tx += PAD_SPEED * dt;
    } else {
        tx = mouseX - paddle.w / 2;
    }
    paddle.x = Math.max(0, Math.min(CW - paddle.w, tx));
}

function moveBall(dt, now) {
    // Normalize to current speed
    const spd = currentSpeed(now);
    const mag = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (mag > 0.001) {
        ball.vx = (ball.vx / mag) * spd;
        ball.vy = (ball.vy / mag) * spd;
    }

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Side walls
    if (ball.x - BALL_R < 0)  { ball.x = BALL_R;       ball.vx =  Math.abs(ball.vx); }
    if (ball.x + BALL_R > CW) { ball.x = CW - BALL_R;  ball.vx = -Math.abs(ball.vx); }
    // Top wall
    if (ball.y - BALL_R < HUD_H) { ball.y = HUD_H + BALL_R; ball.vy = Math.abs(ball.vy); }

    // Paddle
    if (
        ball.vy > 0 &&
        ball.y + BALL_R >= paddle.y &&
        ball.y          <= paddle.y + paddle.h &&
        ball.x + BALL_R >= paddle.x &&
        ball.x - BALL_R <= paddle.x + paddle.w
    ) {
        ball.y = paddle.y - BALL_R;
        const rel   = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2); // -1..1
        const angle = rel * (70 * Math.PI / 180);
        ball.vx = spd * Math.sin(angle);
        ball.vy = -spd * Math.cos(angle);
        enforceMinAngle();
    }

    // Bricks
    for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (!b.alive) continue;
        if (
            ball.x + BALL_R > b.x &&
            ball.x - BALL_R < b.x + b.w &&
            ball.y + BALL_R > b.y &&
            ball.y - BALL_R < b.y + b.h
        ) {
            const oL = (ball.x + BALL_R) - b.x;
            const oR = (b.x + b.w) - (ball.x - BALL_R);
            const oT = (ball.y + BALL_R) - b.y;
            const oB = (b.y + b.h) - (ball.y - BALL_R);
            const min = Math.min(oL, oR, oT, oB);

            if (min === oL || min === oR) { ball.vx = -ball.vx; }
            else                          { ball.vy = -ball.vy; }

            b.hits--;
            if (b.hits <= 0) {
                b.alive = false;
                score += b.pts;
                bricksDestroyed++;
                spawnParticles(b.x + b.w / 2, b.y + b.h / 2, b.color);
                updateHUDDisplay();
                if (bricksDestroyed % PU_INTERVAL === 0) spawnPowerup(b.x + b.w / 2, b.y);
                if (bricks.every(function(br) { return !br.alive; })) {
                    triggerLevelClear(now);
                    return;
                }
            } else {
                b.color   = '#9E9E9E';
                b.armored = false;
            }
            break;
        }
    }

    // Ball out
    if (ball.y - BALL_R > CH) loseLife();
}

function currentSpeed(now) {
    const base = SPEED_BASE * Math.pow(1 + SPEED_INC, level - 1);
    return (now && now < puSlowEnd) ? base * 0.55 : base;
}

function enforceMinAngle() {
    const spd   = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const absVx = Math.abs(ball.vx);
    const absVy = Math.abs(ball.vy);
    // angle from horizontal = atan2(absVy, absVx)
    // if vy/spd < sin(MIN_ANGLE) → too horizontal
    if (absVy / spd < Math.sin(MIN_ANGLE)) {
        const signY = ball.vy >= 0 ? 1 : -1;
        ball.vy = spd * Math.sin(MIN_ANGLE) * signY;
        ball.vx = Math.sqrt(spd * spd - ball.vy * ball.vy) * (ball.vx >= 0 ? 1 : -1);
    }
    // if vx/spd < sin(MIN_ANGLE) → too vertical
    if (absVx / spd < Math.sin(MIN_ANGLE)) {
        const signX = ball.vx >= 0 ? 1 : -1;
        ball.vx = spd * Math.sin(MIN_ANGLE) * signX;
        ball.vy = Math.sqrt(spd * spd - ball.vx * ball.vx) * (ball.vy >= 0 ? 1 : -1);
    }
}

function loseLife() {
    lives--;
    updateHUDDisplay();
    if (lives <= 0) {
        triggerGameOver();
    } else {
        resetBall();
        gameState = 'ready';
    }
}

function triggerLevelClear(now) {
    gameState           = 'level_clear';
    levelClearTime      = now;
    levelClearCountdown = 3;
    stopLoop();

    const el = document.getElementById('bricks-levelclear');
    if (el) el.classList.add('active');

    const titleEl = document.getElementById('bricks-level-text');
    if (titleEl) {
        const lang = getLang();
        titleEl.textContent = lang === 'pl'
            ? 'Poziom ' + level + ' ukończony!'
            : 'Level ' + level + ' complete!';
    }
    const cdEl = document.getElementById('bricks-countdown');
    if (cdEl) cdEl.textContent = '3';

    // Restart loop for countdown + particles
    lastTime  = null;
    animFrame = requestAnimationFrame(loop);
}

function triggerGameOver() {
    gameState = 'game_over';
    stopLoop();

    const isNew = score > highScore;
    if (isNew) { highScore = score; localStorage.setItem(HS_KEY, highScore); }

    updateHUDDisplay();

    const el = document.getElementById('bricks-gameover');
    if (el) el.classList.add('active');
    const scoreEl = document.getElementById('bricks-final-score');
    if (scoreEl) scoreEl.textContent = score;
    const hsEl = document.getElementById('bricks-highscore');
    if (hsEl) hsEl.textContent = highScore;
    const recEl = document.getElementById('bricks-new-record');
    if (recEl) recEl.style.display = isNew ? '' : 'none';

    drawFrame();
}

// ── Power-ups ─────────────────────────────────────────────────────────────────
function spawnPowerup(x, y) {
    const types = [PU_WIDE, PU_SLOW, PU_LIFE];
    powerups.push({
        x:    x - PU_W / 2,
        y:    y,
        type: types[Math.floor(Math.random() * types.length)],
    });
}

function movePoweups(dt, now) {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const pu = powerups[i];
        pu.y += PU_SPD * dt;
        if (
            pu.y + PU_H >= paddle.y &&
            pu.y        <= paddle.y + paddle.h &&
            pu.x + PU_W >= paddle.x &&
            pu.x        <= paddle.x + paddle.w
        ) {
            applyPowerup(pu.type, now);
            powerups.splice(i, 1);
        } else if (pu.y > CH) {
            powerups.splice(i, 1);
        }
    }
}

function applyPowerup(type, now) {
    if (type === PU_WIDE) {
        puWideEnd = now + PU_WIDE_DUR;
        paddle.w  = PAD_W_WIDE;
        paddle.x  = Math.min(paddle.x, CW - paddle.w);
    } else if (type === PU_SLOW) {
        puSlowEnd = now + PU_SLOW_DUR;
    } else if (type === PU_LIFE) {
        lives = Math.min(lives + 1, 5);
        updateHUDDisplay();
    }
}

function checkPowerupExpiry(now) {
    if (puWideEnd > 0 && now >= puWideEnd) {
        puWideEnd = 0;
        paddle.w  = PAD_W_BASE;
        paddle.x  = Math.min(paddle.x, CW - paddle.w);
    }
}

// ── Particles ─────────────────────────────────────────────────────────────────
function spawnParticles(cx, cy, color) {
    const n = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 3;
        particles.push({
            x: cx, y: cy,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            w: 3 + Math.random() * 4, h: 3 + Math.random() * 4,
            color: color,
            life: 0, maxLife: 300,
        });
    }
}

function tickParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x    += p.vx * dt;
        p.y    += p.vy * dt;
        p.life += dt * (1000 / 60);
        if (p.life >= p.maxLife) particles.splice(i, 1);
    }
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawFrame() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CW, CH);

    drawHUD();
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(0, HUD_H - 1, CW, 1);

    drawBricks();
    drawPowerups();
    drawParticles();

    if (ball && gameState !== 'game_over') drawBall();
    if (paddle && gameState !== 'game_over') drawPaddle();

    if (gameState === 'ready')    drawPrompt();
}

function drawHUD() {
    const lang = getLang();
    ctx.save();
    ctx.textBaseline = 'alphabetic';

    // Label row
    ctx.font      = '10px system-ui,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'pl' ? 'POZIOM' : 'LEVEL', 10, 14);
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'pl' ? 'WYNIK' : 'SCORE', CW / 2, 14);
    ctx.textAlign = 'right';
    ctx.fillText(lang === 'pl' ? 'REKORD' : 'BEST', CW - 56, 14);

    // Value row
    ctx.font      = 'bold 20px system-ui,sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(String(level), 10, 36);
    ctx.textAlign = 'center';
    ctx.fillText(String(score), CW / 2, 36);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,200,0,0.95)';
    ctx.fillText(String(highScore), CW - 56, 36);

    // Lives (hearts)
    ctx.font      = '16px system-ui,sans-serif';
    ctx.fillStyle = '#E53935';
    ctx.textAlign = 'right';
    let hearts = '';
    for (let i = 0; i < Math.max(0, lives); i++) hearts += '♥';
    ctx.fillText(hearts, CW - 8, 36);

    ctx.restore();
}

function drawBricks() {
    for (let i = 0; i < bricks.length; i++) {
        const b = bricks[i];
        if (!b.alive) continue;

        roundRect(b.x, b.y, b.w, b.h, 3);

        const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
        g.addColorStop(0, lighten(b.color, 24));
        g.addColorStop(1, b.color);
        ctx.fillStyle = g;
        ctx.fill();

        // Armored (still has hits > 1) — white border
        if (b.armored) {
            ctx.strokeStyle = 'rgba(255,255,255,0.55)';
            ctx.lineWidth   = 1.5;
            roundRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, 2);
            ctx.stroke();
        }

        // Grey (first hit done) — crack
        if (b.color === '#9E9E9E') {
            ctx.strokeStyle = 'rgba(0,0,0,0.55)';
            ctx.lineWidth   = 1.5;
            ctx.beginPath();
            ctx.moveTo(b.x + b.w * 0.35, b.y + 2);
            ctx.lineTo(b.x + b.w * 0.50, b.y + b.h / 2);
            ctx.lineTo(b.x + b.w * 0.65, b.y + b.h - 2);
            ctx.stroke();
        }
    }
}

function drawPaddle() {
    const now   = Date.now();
    const color = now < puWideEnd ? '#4CAF50' : '#1565C0';
    roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
    const g = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
    g.addColorStop(0, '#fff');
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.fill();
}

function drawBall() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle   = '#fff';
    ctx.shadowColor = 'rgba(255,255,255,0.75)';
    ctx.shadowBlur  = 10;
    ctx.fill();
    ctx.restore();
}

function drawPowerups() {
    const PU_COLORS = { [PU_WIDE]: '#4CAF50', [PU_SLOW]: '#1E88E5', [PU_LIFE]: '#E53935' };
    const PU_ICONS  = { [PU_WIDE]: '←→',     [PU_SLOW]: '⏱',       [PU_LIFE]: '♥' };
    ctx.save();
    for (let i = 0; i < powerups.length; i++) {
        const pu = powerups[i];
        roundRect(pu.x, pu.y, PU_W, PU_H, 4);
        ctx.fillStyle = PU_COLORS[pu.type] || '#888';
        ctx.fill();
        ctx.font         = '11px system-ui,sans-serif';
        ctx.fillStyle    = '#fff';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(PU_ICONS[pu.type] || '?', pu.x + PU_W / 2, pu.y + PU_H / 2);
    }
    ctx.restore();
}

function drawParticles() {
    ctx.save();
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.fillStyle   = p.color;
        ctx.fillRect(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h);
    }
    ctx.restore();
}

function drawPrompt() {
    const lang = getLang();
    const line1 = lang === 'pl' ? 'Kliknij / Dotknij / Spacja' : 'Click / Tap / Space';
    const line2 = lang === 'pl' ? 'aby wypuścić piłkę' : 'to launch the ball';
    ctx.save();
    ctx.font         = '13px system-ui,sans-serif';
    ctx.fillStyle    = 'rgba(255,255,255,0.65)';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(line1, CW / 2, PAD_Y - 30);
    ctx.fillText(line2, CW / 2, PAD_Y - 14);
    ctx.restore();
}

// ── HUD DOM ───────────────────────────────────────────────────────────────────
function updateHUDDisplay() {
    const sc = document.getElementById('session-score');
    const hs = document.getElementById('high-score');
    if (sc) sc.textContent = score || 0;
    if (hs) hs.textContent = (highScore > 0) ? highScore : '—';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y,         x + r, y);
    ctx.closePath();
}

function lighten(hex, amt) {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
    return '#' + [r, g, b].map(function(v) { return v.toString(16).padStart(2, '0'); }).join('');
}

function hideAllOverlays() {
    ['bricks-tutorial', 'bricks-levelclear', 'bricks-gameover'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
}

// ── Input ─────────────────────────────────────────────────────────────────────
function launchBall() {
    if (gameState !== 'ready') return;
    ballOnPaddle = false;
    gameState    = 'playing';
    const spd   = currentSpeed(Date.now());
    const angle = (Math.random() - 0.5) * (60 * Math.PI / 180);
    ball.vx = spd * Math.sin(angle);
    ball.vy = -spd * Math.cos(angle);
    enforceMinAngle();
}

function setupInputHandlers() {
    // Mouse move — only track X
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) * (CW / rect.width);
    });

    canvas.addEventListener('click', launchBall);

    // Touch
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        touchX = (e.touches[0].clientX - rect.left) * (CW / rect.width);
        launchBall();
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        touchX = (e.touches[0].clientX - rect.left) * (CW / rect.width);
    }, { passive: false });

    // Keyboard
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft')  { keysLeft  = true;  keysRight = false; }
        if (e.key === 'ArrowRight') { keysRight = true;  keysLeft  = false; }
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); launchBall(); }
    });
    document.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowLeft')  keysLeft  = false;
        if (e.key === 'ArrowRight') keysRight = false;
    });
}

// ── DOM events ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const btnRestart = document.getElementById('btn-bricks-restart');
    if (btnRestart) btnRestart.addEventListener('click', startNewGame);

    const btnStatus = document.getElementById('btn-restart');
    if (btnStatus) btnStatus.addEventListener('click', startNewGame);
});
