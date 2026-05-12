const GAME_CONFIG = {
    id: 'invaders',
    nameKey: 'game_invaders_name',
    hasEndState: true,
    scoringType: 'sum',
};

const TUT_KEY = 'hbp_tutorial_invaders_seen';
const HS_KEY  = 'hbp_highscore_invaders';

// ── Formation constants ───────────────────────────────────────────────────────
const COLS     = 10;
const ROWS     = 5;
const INV_SIZE = 18;
const INV_GAP  = 10;
const INV_STEP = INV_SIZE + INV_GAP;   // 28 px per cell
const FORM_W   = COLS * INV_STEP - INV_GAP; // 270 px

const ROW_COLORS = ['#9c27b0', '#ff9800', '#4caf50']; // cycles: purple→orange→green

// ── Bullet / UFO constants ────────────────────────────────────────────────────
const PB_W = 3, PB_H = 10, PB_SPD = 8;
const EB_W = 3, EB_H = 12, EB_SPD = 3;
const UFO_H        = 16;
const UFO_SPD      = 2.5;
const VX_START     = 1;       // px per dt unit (≈1 px/frame at 60 fps)
const FIRE_BASE_MS = 2000;
const SHIFT_MS     = 400;
const ENTRY_MS     = 400;

// ── Dynamic layout ────────────────────────────────────────────────────────────
let PLAYER_W, PLAYER_H, UFO_W;
let CW, CH, canvas, ctx;
let FORM_TOP, FLOOR_Y;

// ── State ─────────────────────────────────────────────────────────────────────
let gameState;
let score, lives, rowsAdded, gameStartTs;
let player, playerBullet, enemyBullets;
let invaders, currentBottomRowGroup;
let ufo, ufoTimeout;
let formation;
let fireTimeout;
let newRowMsgTs;
let restartBtn;
let rafId, lastTs;

const keys = {};
const mob  = { left: false, right: false, fire: false };
let prevFire = false;

// ── Language helper ───────────────────────────────────────────────────────────
function getFiringFasterMsg() {
    const m = document.cookie.match(/(?:^|;\s*)lang=(\w+)/);
    return (m && m[1] === 'en') ? 'Firing faster!' : 'Strzelają szybciej!';
}

// ── Init ──────────────────────────────────────────────────────────────────────
function initGame() {
    canvas = document.getElementById('invaders-canvas');
    ctx    = canvas.getContext('2d');

    const wrap = canvas.parentElement;
    CW = Math.max(280, Math.min(wrap.clientWidth || (window.innerWidth - 32), 480));
    const maxH = Math.max(320, window.innerHeight - 260); // 260 = header+statusbar+ad+controls
    CH = Math.min(Math.round(CW * 1.45), 600, maxH);
    canvas.width  = CW;
    canvas.height = CH;

    PLAYER_W = Math.round(CW * 0.095);
    PLAYER_H = Math.round(PLAYER_W * 0.56);
    UFO_W    = Math.round(CW * 0.12);
    FORM_TOP = 44;
    FLOOR_Y  = CH - 18;

    if (localStorage.getItem(TUT_KEY)) {
        startGame();
    } else {
        const tut = document.getElementById('invaders-tutorial');
        if (tut) tut.classList.add('active');
        drawBg();
    }
}

function startGame() {
    cancelAnimationFrame(rafId);
    clearTimeout(ufoTimeout);
    clearTimeout(fireTimeout);

    score = 0; lives = 3; rowsAdded = 0; gameStartTs = performance.now();
    restartBtn  = null;
    newRowMsgTs = 0;
    gameState   = 'playing';

    buildWave();
    lastTs = null;
    rafId  = requestAnimationFrame(loop);
}

function buildWave() {
    playerBullet = null;
    enemyBullets = [];
    ufo          = null;
    prevFire     = false;

    player = { x: CW / 2 - PLAYER_W / 2, y: FLOOR_Y - PLAYER_H };

    const startX = Math.round((CW - FORM_W) / 2);
    invaders = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            invaders.push({
                x:        startX + c * INV_STEP,
                y:        FORM_TOP + r * INV_STEP,
                col:      c,
                rowGroup: r,
                alive:    true,
                color:    ROW_COLORS[r % ROW_COLORS.length],
            });
        }
    }

    currentBottomRowGroup = ROWS - 1; // row group 2 initially

    formation = {
        vx:        VX_START,
        animState: 'idle', // 'idle' | 'shifting' | 'entering'
        animStart: 0,
    };

    scheduleEnemyFire();
    scheduleUfo();
}

// ── Row shift + entry animations ───────────────────────────────────────────────
function startShiftAnim() {
    if (formation.animState !== 'idle') return;
    formation.animState = 'shifting';
    formation.animStart = performance.now();
    for (const inv of invaders) {
        if (inv.alive) inv.shiftStartY = inv.y;
    }
}

function finishShift() {
    // Settle all alive non-new invaders one step lower
    for (const inv of invaders) {
        if (inv.alive && !inv.isNew) inv.y = inv.shiftStartY + INV_STEP;
    }
    formation.animState = 'entering';
    formation.animStart = performance.now();
    spawnEntryRow();
}

function spawnEntryRow() {
    const alive   = invaders.filter(i => i.alive && !i.isNew);
    const topY    = alive.length ? Math.min(...alive.map(i => i.y)) : FORM_TOP + INV_STEP;
    const targetY = topY - INV_STEP;
    const startY  = Math.min(-INV_SIZE, targetY - INV_STEP);

    // X base: extrapolate from any alive invader's column position
    const ref   = alive[0];
    const baseX = ref ? ref.x - ref.col * INV_STEP : Math.round((CW - FORM_W) / 2);

    const newRg = -(rowsAdded + 1); // unique negative group id
    for (let c = 0; c < COLS; c++) {
        invaders.push({
            x:            baseX + c * INV_STEP,
            y:            startY,
            entryStartY:  startY,
            entryTargetY: targetY,
            col:          c,
            rowGroup:     newRg,
            alive:        true,
            isNew:        true,
            color:        ROW_COLORS[0], // new rows always purple (top color)
        });
    }
}

function finishEntry() {
    for (const inv of invaders) {
        if (inv.isNew) { inv.y = inv.entryTargetY; inv.isNew = false; }
    }
    formation.animState = 'idle';
    rowsAdded++;
    newRowMsgTs = performance.now();

    // Identify new bottom row group
    const alive = invaders.filter(i => i.alive);
    if (alive.length > 0) {
        const maxY = Math.max(...alive.map(i => i.y));
        currentBottomRowGroup = alive
            .filter(i => Math.abs(i.y - maxY) < INV_STEP * 0.5)
            .map(i => i.rowGroup)[0] ?? currentBottomRowGroup;
    }

    clearTimeout(fireTimeout);
    scheduleEnemyFire();

    // Edge case: bottom row was fully cleared during the animation
    if (alive.length === 0 ||
        !invaders.some(i => i.rowGroup === currentBottomRowGroup && i.alive)) {
        startShiftAnim();
    }
}

// ── Timers ─────────────────────────────────────────────────────────────────────
function scheduleEnemyFire() {
    clearTimeout(fireTimeout);
    const elapsed  = (performance.now() - gameStartTs) / 1000; // seconds
    const timeMult = Math.max(0.2, 1 - elapsed / 80);          // 0→1.0, 80s→0.2
    const rowMult  = Math.pow(0.82, rowsAdded);
    const delay    = Math.max(120,
        Math.round(FIRE_BASE_MS * timeMult * rowMult) + Math.random() * 300
    );
    fireTimeout = setTimeout(function() {
        if (gameState === 'playing') { enemyShoot(); scheduleEnemyFire(); }
    }, delay);
}

function scheduleUfo() {
    clearTimeout(ufoTimeout);
    const delay = 14000 + Math.random() * 16000;
    ufoTimeout = setTimeout(function() {
        if (gameState === 'playing' && !ufo) {
            const goRight = Math.random() < 0.5;
            ufo = { x: goRight ? -UFO_W - 4 : CW + 4, y: 18, dir: goRight ? 1 : -1 };
        }
        if (gameState === 'playing') scheduleUfo();
    }, delay);
}

function enemyShoot() {
    const elapsed  = (performance.now() - gameStartTs) / 1000;
    const maxBulls = 3 + Math.min(rowsAdded, 3) + Math.floor(elapsed / 20);
    if (enemyBullets.length >= Math.min(maxBulls, 8)) return;
    const alive = invaders.filter(i => i.alive);
    if (!alive.length) return;

    // Shoot from a random invader in the bottom-most visible row
    const maxY    = Math.max(...alive.map(i => i.y));
    const botRow  = alive.filter(i => Math.abs(i.y - maxY) < INV_STEP * 0.5);
    const shooter = botRow[Math.floor(Math.random() * botRow.length)];
    enemyBullets.push({
        x: shooter.x + INV_SIZE / 2 - EB_W / 2,
        y: shooter.y + INV_SIZE,
    });
}

// ── Update ─────────────────────────────────────────────────────────────────────
function update(dt, ts) {
    // Animate shift / entry
    if (formation.animState === 'shifting') {
        const p = Math.min(1, (ts - formation.animStart) / SHIFT_MS);
        for (const inv of invaders) {
            if (inv.alive && !inv.isNew) inv.y = inv.shiftStartY + INV_STEP * p;
        }
        if (p >= 1) finishShift();

    } else if (formation.animState === 'entering') {
        const p = Math.min(1, (ts - formation.animStart) / ENTRY_MS);
        for (const inv of invaders) {
            if (inv.alive && inv.isNew) {
                inv.y = inv.entryStartY + p * (inv.entryTargetY - inv.entryStartY);
            }
        }
        if (p >= 1) finishEntry();
    }

    // Horizontal movement runs during all states
    moveFormationX(dt);

    updatePlayer(dt);
    moveBullets(dt);
    moveUfo(dt);
    checkCollisions();
    updateHUD();
}

function moveFormationX(dt) {
    const alive = invaders.filter(i => i.alive);
    if (!alive.length) return;

    const dx     = formation.vx * dt;
    const leftX  = Math.min(...alive.map(i => i.x));
    const rightX = Math.max(...alive.map(i => i.x + INV_SIZE));

    if (formation.vx > 0 && rightX + dx >= CW - 4) {
        formation.vx = -Math.abs(formation.vx);
    } else if (formation.vx < 0 && leftX + dx <= 4) {
        formation.vx = Math.abs(formation.vx);
    } else {
        for (const inv of alive) inv.x += dx;
    }
}

function updatePlayer(dt) {
    if (keys['ArrowLeft']  || keys['a'] || keys['A'] || mob.left)  player.x -= 4 * dt;
    if (keys['ArrowRight'] || keys['d'] || keys['D'] || mob.right) player.x += 4 * dt;
    player.x = Math.max(0, Math.min(CW - PLAYER_W, player.x));

    const wantFire = !!(keys[' '] || mob.fire);
    if (wantFire && !prevFire && !playerBullet) {
        playerBullet = {
            x: Math.round(player.x + PLAYER_W / 2 - PB_W / 2),
            y: player.y - PB_H,
        };
    }
    prevFire = wantFire;
}

function moveBullets(dt) {
    if (playerBullet) {
        playerBullet.y -= PB_SPD * dt;
        if (playerBullet.y + PB_H < 0) playerBullet = null;
    }
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += EB_SPD * dt;
        if (enemyBullets[i].y > CH + 20) enemyBullets.splice(i, 1);
    }
}

function moveUfo(dt) {
    if (!ufo) return;
    ufo.x += UFO_SPD * ufo.dir * dt;
    if (ufo.x > CW + UFO_W + 4 || ufo.x < -UFO_W * 2 - 4) ufo = null;
}

// ── Collisions ─────────────────────────────────────────────────────────────────
function overlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function checkCollisions() {
    if (playerBullet) {
        for (const inv of invaders) {
            if (!inv.alive) continue;
            if (overlap(playerBullet.x, playerBullet.y, PB_W, PB_H,
                        inv.x, inv.y, INV_SIZE, INV_SIZE)) {
                inv.alive    = false;
                score       += inv.color === ROW_COLORS[0] ? 30
                             : inv.color === ROW_COLORS[1] ? 20 : 10;
                playerBullet = null;

                if (formation.animState === 'idle') {
                    checkAnyRowCleared(inv);
                }
                break;
            }
        }
    }

    if (playerBullet && ufo &&
        overlap(playerBullet.x, playerBullet.y, PB_W, PB_H, ufo.x, ufo.y, UFO_W, UFO_H)) {
        score += 100; ufo = null; playerBullet = null;
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        if (overlap(b.x, b.y, EB_W, EB_H, player.x, player.y, PLAYER_W, PLAYER_H)) {
            enemyBullets.splice(i, 1); hitPlayer(); return;
        }
    }
}

function checkAnyRowCleared(killedInv) {
    if (invaders.some(i => i.rowGroup === killedInv.rowGroup && i.alive)) return;
    startShiftAnim();
}

function hitPlayer() {
    lives--;
    updateHUD();
    if (lives <= 0) { triggerGameOver(); return; }
    player.x     = CW / 2 - PLAYER_W / 2;
    enemyBullets = [];
}

function triggerGameOver() {
    gameState = 'over';
    clearTimeout(fireTimeout);
    clearTimeout(ufoTimeout);
    cancelAnimationFrame(rafId);

    const prev = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    if (score > prev) {
        localStorage.setItem(HS_KEY, score);
        const badge = document.getElementById('new-record-badge');
        if (badge) {
            badge.classList.add('new-record-show');
            setTimeout(() => badge.classList.remove('new-record-show'), 3000);
        }
    }
    updateHUD();
    drawBg(); drawAll(); drawGameOverOverlay();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawBg() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CW, CH);
}

function drawAll() {
    drawHUDCanvas();
    drawInvaders();
    if (ufo) drawUfo();
    drawPlayerShip();
    drawBullets();
}

function drawFrame() {
    drawBg(); drawAll();
    if (newRowMsgTs && performance.now() - newRowMsgTs < 1500) drawNewRowMsg();
}

function drawHUDCanvas() {
    const fs = Math.max(11, Math.round(CW * 0.036));
    ctx.font         = 'bold ' + fs + 'px monospace';
    ctx.textBaseline = 'top';

    ctx.fillStyle = '#33ff33';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE ' + String(score).padStart(5, '0'), 6, 5);

    const hs = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    ctx.textAlign = 'center';
    ctx.fillText('HI ' + String(hs).padStart(5, '0'), CW / 2, 5);

    ctx.textAlign = 'right';
    ctx.fillText('♥'.repeat(Math.max(0, lives)), CW - 6, 5);

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign    = 'left';
    ctx.strokeStyle  = '#115511';
    ctx.lineWidth    = 1;
    ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(CW, 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, FLOOR_Y + PLAYER_H + 2); ctx.lineTo(CW, FLOOR_Y + PLAYER_H + 2); ctx.stroke();
}

function drawInvaders() {
    for (const inv of invaders) {
        if (!inv.alive) continue;
        const x = Math.round(inv.x);
        const y = Math.round(inv.y);

        ctx.fillStyle = inv.color;
        ctx.fillRect(x, y, INV_SIZE, INV_SIZE);

        // Highlight edge
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(x, y, INV_SIZE, 2);
        ctx.fillRect(x, y, 2, INV_SIZE);

        // Eyes
        const er  = Math.max(2, Math.round(INV_SIZE * 0.13));
        const ex1 = x + Math.round(INV_SIZE * 0.28);
        const ex2 = x + Math.round(INV_SIZE * 0.72);
        const ey  = y + Math.round(INV_SIZE * 0.38);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ex1, ey, er, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2, ey, er, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(ex1, ey, er * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2, ey, er * 0.5, 0, Math.PI * 2); ctx.fill();
    }
}

function drawUfo() {
    const x = Math.round(ufo.x), y = ufo.y;
    ctx.fillStyle = '#ff2222';
    ctx.fillRect(x + 6, y + 6, UFO_W - 12, UFO_H - 6);
    ctx.beginPath();
    ctx.ellipse(x + UFO_W / 2, y + 6, UFO_W / 2 - 4, 9, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + 3,             y + UFO_H - 4, 6, 4);
    ctx.fillRect(x + UFO_W / 2 - 3, y + UFO_H - 4, 6, 4);
    ctx.fillRect(x + UFO_W - 9,     y + UFO_H - 4, 6, 4);
    ctx.fillRect(x + UFO_W / 2 - 1, y - 4, 2, 6);
    ctx.fillRect(x + UFO_W / 2 - 3, y - 4, 6, 2);
}

function drawPlayerShip() {
    const x = Math.round(player.x), y = player.y;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x + PLAYER_W / 2, y);
    ctx.lineTo(x + PLAYER_W,     y + PLAYER_H);
    ctx.lineTo(x,                y + PLAYER_H);
    ctx.closePath();
    ctx.fill();
}

function drawBullets() {
    if (playerBullet) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(Math.round(playerBullet.x), Math.round(playerBullet.y), PB_W, PB_H);
    }
    ctx.fillStyle = '#ff5533';
    for (const b of enemyBullets) {
        ctx.fillRect(Math.round(b.x), Math.round(b.y), EB_W, EB_H);
    }
}

function drawNewRowMsg() {
    ctx.font         = 'bold ' + Math.round(CW * 0.048) + 'px monospace';
    ctx.fillStyle    = '#ff3333';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getFiringFasterMsg(), CW / 2, CH / 2);
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawGameOverOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, CW, CH);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    ctx.font      = 'bold ' + Math.round(CW * 0.068) + 'px monospace';
    ctx.fillStyle = '#ff3333';
    ctx.fillText('GAME OVER', CW / 2, CH * 0.26);

    ctx.font      = 'bold ' + Math.round(CW * 0.052) + 'px monospace';
    ctx.fillStyle = '#33ff33';
    ctx.fillText(String(score).padStart(5, '0'), CW / 2, CH * 0.40);

    const hs = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    ctx.font      = Math.round(CW * 0.032) + 'px monospace';
    ctx.fillStyle = (score >= hs && score > 0) ? '#f8d800' : '#557755';
    ctx.fillText('BEST ' + String(hs).padStart(5, '0'), CW / 2, CH * 0.50);

    ctx.font      = Math.round(CW * 0.028) + 'px monospace';
    ctx.fillStyle = '#aaffaa';
    ctx.fillText('+' + rowsAdded + ' ROWS', CW / 2, CH * 0.58);

    const bw = Math.round(CW * 0.62), bh = 46;
    const bx = CW / 2 - bw / 2, by = CH * 0.68;
    ctx.strokeStyle = '#33ff33'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#33ff33';
    ctx.font      = Math.round(CW * 0.036) + 'px monospace';
    ctx.fillText('[ PLAY AGAIN ]', CW / 2, by + bh / 2);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

    restartBtn = { x: bx, y: by, w: bw, h: bh };
}

// ── HUD (HTML) ─────────────────────────────────────────────────────────────────
function updateHUD() {
    const sc = document.getElementById('session-score');
    const hs = document.getElementById('high-score');
    if (sc) sc.textContent = score;
    if (hs) hs.textContent = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
}

// ── Loop ──────────────────────────────────────────────────────────────────────
function loop(ts) {
    if (gameState !== 'playing') return;
    const dt = lastTs ? Math.min((ts - lastTs) / 16.667, 3) : 1;
    lastTs = ts;
    update(dt, ts);
    drawFrame();
    rafId = requestAnimationFrame(loop);
}

// ── Input ──────────────────────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    if (gameState === 'over' && (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'r')) startGame();
});
document.addEventListener('keyup', function(e) { delete keys[e.key]; });

// ── DOM ────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const cvs = document.getElementById('invaders-canvas');
    if (!cvs) return;

    function tapRestart(cx, cy) {
        if (gameState !== 'over' || !restartBtn) return false;
        const rect = cvs.getBoundingClientRect();
        const x = (cx - rect.left) * (CW / rect.width);
        const y = (cy - rect.top)  * (CH / rect.height);
        const b = restartBtn;
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { startGame(); return true; }
        return false;
    }

    cvs.addEventListener('click', e => tapRestart(e.clientX, e.clientY));
    cvs.addEventListener('touchend', function(e) {
        e.preventDefault();
        const t = e.changedTouches[0];
        tapRestart(t.clientX, t.clientY);
    }, { passive: false });

    const btnStart = document.getElementById('btn-invaders-start');
    if (btnStart) {
        btnStart.addEventListener('click', function() {
            localStorage.setItem(TUT_KEY, '1');
            const tut = document.getElementById('invaders-tutorial');
            if (tut) tut.classList.remove('active');
            startGame();
        });
    }

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) btnRestart.addEventListener('click', startGame);

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

    bindMob('btn-inv-left',  'left');
    bindMob('btn-inv-right', 'right');
    bindMob('btn-inv-fire',  'fire');
});
