// Flappy Runner — endless side-scroller
// Load order: counter.js → game.js → session.js (session.js calls initGame)

const GAME_CONFIG = {
    id:          'runner',
    nameKey:     'game_runner_name',
    hasEndState: true,
    scoringType: 'count',
};

const HS_KEY = 'hbp_highscore_runner';

// Canvas & context (assigned in initGame)
let canvas, ctx;

// Fixed logical resolution — CSS scales the element to display size
const W = 480, H = 270;
const GROUND   = H - 48;
const GRAVITY  = 0.55, JUMP_V = -11.5;
const PX = 64, PW = 22, PH = 26; // player fixed x, width, height

// Stars computed once per session
let STARS = null;

// Game state
let state = null; // 'idle' | 'playing' | 'dead'
let py, pvy, grounded, squash, jumps;
let obstacles, score, highScore, newBest, speed, frame, nextObstacle, dashOffset;
let rafId = null;

// ── Init (called by session.js after session_start succeeds) ──────────────────

function initGame() {
    canvas     = document.getElementById('runner-canvas');
    ctx        = canvas.getContext('2d');
    canvas.width  = W;
    canvas.height = H;

    if (!STARS) {
        STARS = Array.from({ length: 45 }, () => ({
            x: Math.random() * W,
            y: Math.random() * (GROUND * 0.85),
            r: Math.random() * 1.4 + 0.4,
            a: Math.random() * 0.5 + 0.25,
        }));
    }

    highScore = parseInt(localStorage.getItem(HS_KEY) || '0', 10);

    state        = 'idle';
    py           = GROUND - PH;
    pvy          = 0;
    grounded     = true;
    squash       = 0;
    jumps        = 0;
    obstacles    = [];
    score        = 0;
    newBest      = false;
    speed        = 3;
    frame        = 0;
    nextObstacle = 80;
    dashOffset   = 0;

    updateHUD();

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
}

// ── Restart (called by btn-restart and canvas retry tap) ─────────────────────

function restartGame() {
    if (!state) return;
    state        = 'playing';
    py           = GROUND - PH;
    pvy          = 0;
    grounded     = true;
    squash       = 0;
    jumps        = 0;
    obstacles    = [];
    score        = 0;
    newBest      = false;
    speed        = 3;
    frame        = 0;
    nextObstacle = 80;
    dashOffset   = 0;
    doJump();
    updateHUD();
}

// ── Jump ─────────────────────────────────────────────────────────────────────

function doJump() {
    if (grounded) {
        pvy      = JUMP_V;
        squash   = 1.1;
        grounded = false;
        jumps    = 1;
    } else if (jumps < 2) {
        pvy    = JUMP_V * 0.82;
        squash = 0.85;
        jumps++;
    }
}

function tryJump() {
    if (!state) return;
    if (state === 'idle')    { state = 'playing'; doJump(); }
    else if (state === 'dead')  { restartGame(); }
    else if (state === 'playing') { doJump(); }
}

// ── Input ────────────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); tryJump(); }
});

{
    const cvs = document.getElementById('runner-canvas');
    // pointerdown fires once per gesture (touch OR mouse), preventing
    // the double-fire that touchstart + mousedown causes on mobile
    cvs?.addEventListener('pointerdown', e => { e.preventDefault(); tryJump(); });
}

document.getElementById('btn-restart')?.addEventListener('click', restartGame);

// ── Update ───────────────────────────────────────────────────────────────────

function update() {
    if (state !== 'playing') return;

    frame++;
    speed      = 4 + frame * 0.005;
    dashOffset = (dashOffset + speed) % 64;

    // Physics
    pvy += GRAVITY;
    py  += pvy;
    if (py >= GROUND - PH) {
        if (!grounded) squash = -0.45;
        py       = GROUND - PH;
        pvy      = 0;
        grounded = true;
        jumps    = 0;
    }

    // Squash decay
    if (squash > 0)        squash -= 0.07;
    else if (squash < 0)   squash += 0.09;
    if (Math.abs(squash) < 0.02) squash = 0;

    // Spawn obstacles
    if (--nextObstacle <= 0) {
        obstacles.push({
            x:      W + 12,
            w:      18 + Math.floor(Math.random() * 14),
            h:      20 + Math.floor(Math.random() * 54),
            scored: false,
        });
        nextObstacle = Math.max(28, 80 - frame * 0.06) + Math.floor(Math.random() * 25);
    }

    // Move obstacles, score on clear, collision
    const M = 4;
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= speed;
        if (obstacles[i].x + obstacles[i].w < 0) { obstacles.splice(i, 1); continue; }

        // Score point when obstacle fully passes player
        if (!obstacles[i].scored && obstacles[i].x + obstacles[i].w < PX) {
            obstacles[i].scored = true;
            score++;
            if (score > highScore) {
                highScore = score;
                newBest   = true;
                localStorage.setItem(HS_KEY, String(highScore));
                showNewRecord();
            }
            updateHUD();
        }

        const o = obstacles[i];
        if (
            PX + M       < o.x + o.w &&
            PX + PW - M  > o.x       &&
            py + M       < GROUND    &&
            py + PH - M  > GROUND - o.h
        ) {
            die();
            return;
        }
    }
}

function die() {
    state = 'dead';
    updateHUD();
}

// ── HUD ──────────────────────────────────────────────────────────────────────

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

// ── Draw ─────────────────────────────────────────────────────────────────────

function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h,     x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y,         x + r, y, r);
    ctx.closePath();
}

function draw() {
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (const s of STARS) {
        ctx.globalAlpha = s.a;
        ctx.fillStyle   = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ground
    ctx.fillStyle = '#0e2a50';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#1c4a7a';
    ctx.fillRect(0, GROUND, W, 2);

    // Scrolling stripe
    ctx.strokeStyle    = 'rgba(100,180,255,0.15)';
    ctx.lineWidth      = 1.5;
    ctx.setLineDash([20, 44]);
    ctx.lineDashOffset = -dashOffset;
    ctx.beginPath();
    ctx.moveTo(0, GROUND + 16);
    ctx.lineTo(W, GROUND + 16);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // Obstacles
    for (const o of obstacles) {
        const oy = GROUND - o.h;
        ctx.fillStyle = '#c0392b';
        rr(o.x, oy, o.w, o.h, 3);
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(o.x - 2, oy, o.w + 4, 6);
        ctx.fillStyle = 'rgba(255,200,200,0.12)';
        ctx.fillRect(o.x + 3, oy + 8, o.w - 6, o.h - 10);
    }

    // Player (squash & stretch, anchored to bottom)
    const scaleX = 1 + squash * 0.18;
    const scaleY = 1 - squash * 0.22;
    const pw     = PW * scaleX;
    const ph     = PH * scaleY;
    const drawX  = PX - (pw - PW) / 2;
    const drawY  = py + (PH - ph);

    ctx.save();
    if (state === 'playing') { ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 10; }
    ctx.fillStyle = '#39ff14';
    rr(drawX, drawY, pw, ph, 4);
    ctx.fill();
    ctx.restore();

    // Eye
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(drawX + pw * 0.72, drawY + ph * 0.28, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // State overlays
    if (state === 'idle')  drawIdleOverlay();
    if (state === 'dead')  drawDeadOverlay();
}

function drawOverlay() {
    ctx.fillStyle = 'rgba(10,8,26,0.82)';
    ctx.fillRect(0, 0, W, H);
}

function drawIdleOverlay() {
    drawOverlay();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#39ff14';
    ctx.font      = 'bold 30px monospace';
    ctx.fillText('FLAPPY RUNNER', W / 2, H / 2 - 26);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font      = '13px monospace';
    ctx.fillText('TAP  or  SPACE  to start', W / 2, H / 2 + 8);
    ctx.fillText('Double jump available!',   W / 2, H / 2 + 28);
    if (highScore > 0) {
        ctx.fillStyle = '#ffd700';
        ctx.font      = '12px monospace';
        ctx.fillText('BEST: ' + highScore,   W / 2, H / 2 + 55);
    }
    ctx.textAlign = 'left';
}

function drawDeadOverlay() {
    drawOverlay();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4455';
    ctx.font      = 'bold 28px monospace';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 38);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font      = '16px monospace';
    ctx.fillText('Score: ' + score, W / 2, H / 2 - 10);
    if (newBest) {
        ctx.fillStyle = '#ffd700';
        ctx.font      = '13px monospace';
        ctx.fillText('NEW BEST!', W / 2, H / 2 + 14);
    }
    const bW = 112, bH = 40, bX = W / 2 - 56, bY = H / 2 + 30;
    ctx.fillStyle = '#e74c3c';
    rr(bX, bY, bW, bH, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 14px monospace';
    ctx.fillText('RETRY', W / 2, bY + bH / 2 + 5);
    ctx.textAlign = 'left';
}

// ── Game loop ─────────────────────────────────────────────────────────────────

function loop() {
    update();
    draw();
    rafId = requestAnimationFrame(loop);
}
