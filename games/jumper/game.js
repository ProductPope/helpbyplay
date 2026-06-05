const GAME_CONFIG = {
    id: 'jumper',
    nameKey: 'game_jumper_name',
    hasEndState: true,
    scoringType: 'sum',
};

const TUT_KEY = 'hbp_tutorial_jumper_seen';
const HS_KEY  = 'hbp_highscore_jumper';

// ── Physics ───────────────────────────────────────────────────────────────────
const GRAVITY      = 0.45;
const JUMP_VY      = -13.5;
const SPRING_VY    = -20.0;
const RUN_ACCEL    = 1.2;
const RUN_DECEL    = 0.82;
const MAX_VX       = 5.5;
const PX_PER_METER = 10;

// ── Platform config ───────────────────────────────────────────────────────────
const PLAT_W_MIN   = 60;
const PLAT_W_MAX   = 120;
const PLAT_GAP_BASE = 70;
const PLAT_GAP_GROW = 0.012;
const PLAT_GAP_MAX  = 180;

// ── Combo ─────────────────────────────────────────────────────────────────────
const COMBO_WINDOW_2 = 2000;
const COMBO_WINDOW_3 = 3000;

// ── State ─────────────────────────────────────────────────────────────────────
let canvas, ctx, CW, CH;
let player, platforms;
let camY;
let gameState, rafId, lastTs;
let maxHeightPx;
let comboJumps, comboMult, comboLabel;
let particles;
let restartBtn;

const keys = {};
const mob  = { left: false, right: false };

// ── Init ──────────────────────────────────────────────────────────────────────

function initGame() {
    canvas = document.getElementById('jumper-canvas');
    ctx    = canvas.getContext('2d');

    const wrap = canvas.parentElement;
    CW = Math.min(wrap.clientWidth || (window.innerWidth - 32), 400);
    CH = Math.min(Math.round(CW * 1.6), 640);
    canvas.width  = CW;
    canvas.height = CH;

    gameState = 'idle';

    if (localStorage.getItem(TUT_KEY)) {
        startGame();
    } else {
        const tut = document.getElementById('jumper-tutorial');
        if (tut) tut.classList.add('active');
        drawIdleFrame();
    }
}

function startGame() {
    cancelAnimationFrame(rafId);

    platforms = [];
    particles = [];
    comboJumps = [];
    comboMult  = 1;
    comboLabel = null;
    restartBtn = null;

    // Starting platform directly under player
    const startY = CH - 80;
    platforms.push(makePlat(CW / 2 - 50, startY, 100, 'normal'));

    // Pre-generate platforms above
    let y = startY - PLAT_GAP_BASE;
    while (y > -CH * 2) {
        y -= nextGap(startY - y);
        platforms.push(randomPlat(y, startY - y));
    }

    player = {
        x:  CW / 2 - 10,
        y:  startY - 36,
        vx: 0,
        vy: 0,
        w:  20,
        h:  32,
        onGround: false,
        facingRight: true,
        runFrame: 0,
        runTick: 0,
        lives: 3,
    };

    camY       = 0;
    maxHeightPx = 0;
    gameState  = 'playing';
    lastTs     = null;
    rafId = requestAnimationFrame(loop);
}

// ── Platform helpers ──────────────────────────────────────────────────────────

function makePlat(x, y, w, type) {
    return {
        x, y, w, h: 12, type,
        // moving
        moveDir:   1,
        moveSpeed: type === 'moving' ? 1.2 + Math.random() * 1.0 : 0,
        moveRange: type === 'moving' ? 50 + Math.random() * 60   : 0,
        ox:        x,
    };
}

function randomPlat(y, heightAboveStart) {
    const w    = PLAT_W_MIN + Math.random() * (PLAT_W_MAX - PLAT_W_MIN);
    const x    = Math.random() * (CW - w);
    const roll = Math.random();
    let type   = 'normal';

    const platCount = platforms.length;
    if (platCount > 0 && platCount % 10 === 0) type = 'spring';
    else if (platCount > 0 && platCount % 15 === 0) type = 'moving';
    else if (roll < 0.08) type = 'spring';
    else if (roll < 0.18) type = 'moving';

    return makePlat(x, y, w, type);
}

function nextGap(heightAboveStart) {
    const grow = Math.min(heightAboveStart * PLAT_GAP_GROW, PLAT_GAP_MAX - PLAT_GAP_BASE);
    return PLAT_GAP_BASE + grow + Math.random() * 24;
}

// ── Update ────────────────────────────────────────────────────────────────────

function update(dt, ts) {
    // Moving platforms
    for (const p of platforms) {
        if (p.type !== 'moving') continue;
        p.x += p.moveDir * p.moveSpeed * dt;
        if (p.x >= p.ox + p.moveRange) { p.x = p.ox + p.moveRange; p.moveDir = -1; }
        if (p.x <= p.ox)               { p.x = p.ox;               p.moveDir =  1; }
    }

    updatePlayer(dt, ts);
    updateParticles(dt);

    // Extend platforms upward as player climbs
    // FIX: re-read platforms[last].y each iteration (not a captured snapshot)
    const screenTop = camY - CH;
    let extendGuard = 0;
    while (platforms.length > 0 &&
           platforms[platforms.length - 1].y > screenTop - CH &&
           extendGuard < 100) {
        extendGuard++;
        const lastY = platforms[platforms.length - 1].y;
        const gap   = nextGap(Math.abs(lastY));
        platforms.push(randomPlat(lastY - gap, Math.abs(lastY)));
    }

    // Remove platforms below screen
    const cutoff = camY + CH + 60;
    while (platforms.length && platforms[0].y > cutoff) {
        platforms.shift();
    }

    updateHUD();
}

function updatePlayer(dt, ts) {
    // Horizontal input
    const goLeft  = !!(keys['ArrowLeft']  || keys['a'] || keys['A'] || mob.left);
    const goRight = !!(keys['ArrowRight'] || keys['d'] || keys['D'] || mob.right);

    if (goLeft)  { player.vx -= RUN_ACCEL * dt; player.facingRight = false; }
    if (goRight) { player.vx += RUN_ACCEL * dt; player.facingRight = true;  }
    if (!goLeft && !goRight) player.vx *= Math.pow(RUN_DECEL, dt);
    player.vx = Math.max(-MAX_VX, Math.min(MAX_VX, player.vx));

    // Animate run frame
    if (Math.abs(player.vx) > 0.5) {
        player.runTick += dt;
        if (player.runTick >= 8) { player.runTick = 0; player.runFrame = 1 - player.runFrame; }
    } else {
        player.runFrame = 0;
    }

    // Gravity
    player.vy += GRAVITY * dt;

    // Move X + wall wrap
    player.x += player.vx * dt;
    if (player.x + player.w < 0)   { player.x = CW; spawnFlash(0, player.y + player.h / 2); }
    if (player.x > CW)             { player.x = -player.w; spawnFlash(CW, player.y + player.h / 2); }

    // Move Y
    player.onGround = false;
    player.y += player.vy * dt;

    // Platform collisions — only when falling
    if (player.vy >= 0) {
        for (const p of platforms) {
            const prevBottom = player.y - player.vy * dt + player.h;
            if (
                player.x + player.w > p.x &&
                player.x < p.x + p.w &&
                prevBottom <= p.y + 2 &&
                player.y + player.h >= p.y &&
                player.y + player.h <= p.y + p.h + 12
            ) {
                player.y      = p.y - player.h;
                player.onGround = true;

                if (p.type === 'spring') {
                    player.vy = SPRING_VY;
                    spawnSmoke(player.x + player.w / 2, player.y + player.h);
                    registerJump(ts);
                } else {
                    player.vy = JUMP_VY;
                    spawnSmoke(player.x + player.w / 2, player.y + player.h);
                    registerJump(ts);
                }
                break;
            }
        }
    }

    // Camera — follows player upward only
    const playerScreenY = player.y - camY;
    if (playerScreenY < CH * 0.4) {
        camY = player.y - CH * 0.4;
    }

    // Track max height
    const heightPx = -player.y;
    if (heightPx > maxHeightPx) maxHeightPx = heightPx;

    // Fell below camera bottom — lose a life
    if (player.y - camY > CH + 80) {
        loseLife();
    }
}

// ── Combo ─────────────────────────────────────────────────────────────────────

function registerJump(ts) {
    comboJumps.push(ts);
    // Keep only jumps within 3 seconds
    comboJumps = comboJumps.filter(t => ts - t < COMBO_WINDOW_3);

    const recent2 = comboJumps.filter(t => ts - t < COMBO_WINDOW_2).length;
    const recent3 = comboJumps.length;

    if (recent3 >= 5) {
        if (comboMult !== 3) spawnComboLabel('x3', player.x + player.w / 2, player.y);
        comboMult = 3;
    } else if (recent2 >= 3) {
        if (comboMult !== 2) spawnComboLabel('x2', player.x + player.w / 2, player.y);
        comboMult = 2;
    } else {
        comboMult = 1;
    }
}

function spawnComboLabel(text, x, y) {
    particles.push({ type: 'combo', text, x, y: y - camY, vy: -1.8, alpha: 1.0, life: 90 });
}

// ── Particles ─────────────────────────────────────────────────────────────────

function spawnSmoke(x, y) {
    for (let i = 0; i < 4; i++) {
        particles.push({
            type:  'smoke',
            x:     x + (Math.random() - 0.5) * 14,
            y:     y - camY,
            vx:    (Math.random() - 0.5) * 1.8,
            vy:    -0.6 - Math.random() * 0.8,
            r:     4 + Math.random() * 4,
            alpha: 0.7,
            life:  22,
        });
    }
}

function spawnFlash(x, y) {
    particles.push({ type: 'flash', x, y: y - camY, alpha: 0.8, life: 10 });
}

function updateParticles(dt) {
    for (const p of particles) {
        p.life -= dt;
        p.alpha = Math.max(0, p.life / (p.type === 'combo' ? 90 : p.type === 'flash' ? 10 : 22));
        if (p.type === 'smoke') { p.x += p.vx * dt; p.y += p.vy * dt; }
        if (p.type === 'combo') p.y += p.vy * dt;
    }
    particles = particles.filter(p => p.life > 0);
}

// ── Background gradient ───────────────────────────────────────────────────────

function skyColors(heightM) {
    // 0m → green/blue, 100m → blue, 300m → deep blue, 600m → purple/dark
    const t = Math.min(heightM / 600, 1);
    const stops = [
        [0,   '#4fc35a', '#5c94fc'],
        [0.2, '#3a78d4', '#5c94fc'],
        [0.5, '#1a4a8a', '#2255cc'],
        [1.0, '#1a0a3a', '#0d1040'],
    ];
    let i = 0;
    while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
    const a = stops[i], b = stops[i + 1];
    const f = (t - a[0]) / (b[0] - a[0]);
    return [lerpColor(a[1], b[1], f), lerpColor(a[2], b[2], f)];
}

function lerpColor(c1, c2, t) {
    const p = (h) => parseInt(h.slice(1), 16);
    const a = p(c1), b = p(c2);
    const r = Math.round(((a >> 16) & 0xff) * (1 - t) + ((b >> 16) & 0xff) * t);
    const g = Math.round(((a >>  8) & 0xff) * (1 - t) + ((b >>  8) & 0xff) * t);
    const bl= Math.round(( a        & 0xff) * (1 - t) + ( b        & 0xff) * t);
    return '#' + [r, g, bl].map(v => v.toString(16).padStart(2, '0')).join('');
}

function platColor(type, heightM) {
    if (type === 'spring')  return '#f8d800';
    if (type === 'moving')  return '#4488ff';
    const t = Math.min(heightM / 600, 1);
    if (t < 0.3) return '#5aa02c';
    if (t < 0.6) return '#3a78d4';
    return '#7744cc';
}

// ── Draw ──────────────────────────────────────────────────────────────────────

function drawFrame(ts) {
    const heightM = maxHeightPx / PX_PER_METER;
    const [sky1, sky2] = skyColors(heightM);

    const grad = ctx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, sky1);
    grad.addColorStop(1, sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);

    ctx.save();
    ctx.translate(0, -Math.round(camY));

    drawPlatforms(heightM);
    drawPlayer(ts);

    ctx.restore();
    drawParticles();
    drawHUDCanvas(heightM);
}

function drawPlatforms(heightM) {
    for (const p of platforms) {
        const sy = p.y - camY;
        if (sy > CH + 20 || sy < -40) continue;

        const ph = Math.abs(p.y) / PX_PER_METER;
        const col = platColor(p.type, ph);

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 4);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(p.x + 2, p.y + 1, p.w - 4, 3);

        // Spring icon
        if (p.type === 'spring') {
            ctx.fillStyle = '#cc8800';
            const cx = p.x + p.w / 2;
            ctx.fillRect(cx - 3, p.y - 8, 6, 8);
            ctx.fillRect(cx - 6, p.y - 10, 12, 3);
        }
    }
}

function drawPlayer(ts) {
    const p  = player;
    const px = Math.round(p.x);
    const py = Math.round(p.y);
    const fr = p.facingRight;

    // Body
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 3, py + 12, p.w - 6, p.h - 12);

    // Head
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(px + 4, py + 2, p.w - 8, 12);

    // Hair / cap
    ctx.fillStyle = '#553300';
    ctx.fillRect(px + 4, py, p.w - 8, 5);

    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(fr ? px + p.w - 8 : px + 4, py + 6, 3, 3);

    // Legs — run animation
    const legOff = p.runFrame === 1 ? 3 : 0;
    ctx.fillStyle = '#334466';
    ctx.fillRect(px + 3, py + p.h - 10 + legOff, 6, 10 - legOff);
    ctx.fillRect(px + p.w - 9, py + p.h - 10 - legOff, 6, 10 + legOff);
}

function drawParticles() {
    for (const p of particles) {
        if (p.type === 'smoke') {
            ctx.globalAlpha = p.alpha * 0.7;
            ctx.fillStyle   = '#ccc';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'combo') {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle   = '#f8d800';
            ctx.font        = 'bold ' + Math.round(CW * 0.07) + 'px monospace';
            ctx.textAlign   = 'center';
            ctx.fillText(p.text, p.x, p.y);
            ctx.textAlign   = 'left';
        } else if (p.type === 'flash') {
            ctx.globalAlpha = p.alpha * 0.6;
            ctx.fillStyle   = '#fff';
            ctx.fillRect(p.x - 6, p.y - 30, 12, 60);
        }
    }
    ctx.globalAlpha = 1;
}

function drawHUDCanvas(heightM) {
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.fillRect(0, 0, CW, 38);

    ctx.font         = 'bold ' + Math.round(CW * 0.064) + 'px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#fff';
    ctx.textAlign    = 'center';
    ctx.fillText(Math.round(heightM) + ' m', CW / 2, 19);

    const hs = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    ctx.font      = Math.round(CW * 0.028) + 'px monospace';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'right';
    ctx.fillText('BEST ' + hs + ' m', CW - 8, 19);

    ctx.fillStyle = '#ff5577';
    ctx.textAlign = 'left';
    ctx.fillText('♥'.repeat(Math.max(0, player ? player.lives : 0)), 8, 19);

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawIdleFrame() {
    ctx.fillStyle = '#3a78d4';
    ctx.fillRect(0, 0, CW, CH);
}

// ── HUD (HTML) ─────────────────────────────────────────────────────────────────

function updateHUD() {
    const sc = document.getElementById('session-score');
    const hs = document.getElementById('high-score');
    const m  = Math.round(maxHeightPx / PX_PER_METER);
    if (sc) sc.textContent = m;
    if (hs) hs.textContent = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
}

// ── Lose life / respawn ───────────────────────────────────────────────────────

function loseLife() {
    player.lives--;
    if (player.lives <= 0) { gameOver(); return; }

    // Find platform closest to screen centre that is still in or near viewport
    const targetY = camY + CH * 0.6;
    let best = null, bestDist = Infinity;
    for (const p of platforms) {
        if (p.y < camY - 80 || p.y > camY + CH + 80) continue;
        const dist = Math.abs(p.y - targetY);
        if (dist < bestDist) { bestDist = dist; best = p; }
    }

    if (!best) {
        // Fallback: create a platform in the middle of the viewport
        const nx = CW / 4 + Math.random() * CW / 2;
        const ny = camY + CH * 0.6;
        best = makePlat(nx, ny, 100, 'normal');
        platforms.push(best);
    }

    player.x  = Math.max(0, Math.min(CW - player.w, best.x + (best.w - player.w) / 2));
    player.y  = best.y - player.h;
    player.vx = 0;
    player.vy = 0;
    camY      = player.y - CH * 0.5;
    updateHUD();
}

// ── Game over ─────────────────────────────────────────────────────────────────

function gameOver() {
    gameState = 'over';
    cancelAnimationFrame(rafId);

    const heightM = Math.round(maxHeightPx / PX_PER_METER);
    const prev    = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    const isNew   = heightM > prev;
    if (isNew) {
        localStorage.setItem(HS_KEY, heightM);
        const badge = document.getElementById('new-record-badge');
        if (badge) {
            badge.classList.add('new-record-show');
            setTimeout(() => badge.classList.remove('new-record-show'), 3000);
        }
    }

    updateHUD();
    drawGameOver(heightM, Math.max(heightM, prev), isNew);
}

function drawGameOver(score, best, isNew) {
    // Darken
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CW, CH);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.font      = 'bold ' + Math.round(CW * 0.058) + 'px monospace';
    ctx.fillStyle = '#ff4444';
    ctx.fillText('GAME OVER', CW / 2, CH * 0.26);

    ctx.font      = Math.round(CW * 0.038) + 'px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(score + ' m', CW / 2, CH * 0.40);

    ctx.font      = Math.round(CW * 0.028) + 'px monospace';
    ctx.fillStyle = isNew ? '#f8d800' : '#aaa';
    ctx.fillText('BEST ' + best + ' m', CW / 2, CH * 0.50);

    const bw = Math.round(CW * 0.55), bh = 46;
    const bx = CW / 2 - bw / 2, by = CH * 0.64;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle   = '#fff';
    ctx.font        = Math.round(CW * 0.032) + 'px monospace';
    ctx.fillText('[ PLAY AGAIN ]', CW / 2, by + bh / 2);

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';

    restartBtn = { x: bx, y: by, w: bw, h: bh };
}

// ── Loop ──────────────────────────────────────────────────────────────────────

function loop(ts) {
    if (gameState !== 'playing') return;
    const dt = lastTs ? Math.min((ts - lastTs) / 16.667, 3) : 1;
    lastTs = ts;
    update(dt, ts);
    drawFrame(ts);
    rafId = requestAnimationFrame(loop);
}

// ── Input ──────────────────────────────────────────────────────────────────────

document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
    if (gameState === 'over' && (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'r')) startGame();
});
document.addEventListener('keyup', function(e) { delete keys[e.key]; });

// ── DOM ready ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const cvs = document.getElementById('jumper-canvas');
    if (!cvs) return;

    function tapRestart(cx, cy) {
        if (gameState !== 'over' || !restartBtn) return false;
        const b = restartBtn;
        const rect = cvs.getBoundingClientRect();
        const sx = CW / rect.width, sy = CH / rect.height;
        const x = (cx - rect.left) * sx, y = (cy - rect.top) * sy;
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { startGame(); return true; }
        return false;
    }

    cvs.addEventListener('click', e => tapRestart(e.clientX, e.clientY));
    cvs.addEventListener('touchend', function(e) {
        e.preventDefault();
        const t = e.changedTouches[0];
        tapRestart(t.clientX, t.clientY);
    }, { passive: false });

    // Tutorial start button
    const btnStart = document.getElementById('btn-jumper-start');
    if (btnStart) {
        btnStart.addEventListener('click', function() {
            localStorage.setItem(TUT_KEY, '1');
            const tut = document.getElementById('jumper-tutorial');
            if (tut) tut.classList.remove('active');
            startGame();
        });
    }

    // HTML restart button
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) btnRestart.addEventListener('click', startGame);

    // Mobile controls
    function bindMob(id, key) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('touchstart', e => { e.preventDefault(); mob[key] = true;  }, { passive: false });
        el.addEventListener('touchend',   e => { e.preventDefault(); mob[key] = false; }, { passive: false });
        el.addEventListener('touchcancel',e => { e.preventDefault(); mob[key] = false; }, { passive: false });
        el.addEventListener('mousedown',  () => mob[key] = true);
        el.addEventListener('mouseup',    () => mob[key] = false);
        el.addEventListener('mouseleave', () => mob[key] = false);
    }

    bindMob('btn-jumper-left',  'left');
    bindMob('btn-jumper-right', 'right');
});
