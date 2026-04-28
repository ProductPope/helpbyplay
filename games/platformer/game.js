const GAME_CONFIG = {
    id: 'platformer',
    nameKey: 'game_platformer_name',
    hasEndState: true,
    scoringType: 'sum',
};

const TUT_KEY   = 'hbp_tutorial_platformer_seen';
const HS_KEY    = 'hbp_highscore_platformer';

// ── Physics ───────────────────────────────────────────────────────────────────
const GRAVITY   = 0.54;
const JUMP_VY   = -10.125;        // -6.75 * 1.5  (+50% jump force)
const RUN_SPD   = 3.5;
const MAX_FALL  = 18;
const FLOOR_H   = 36;
const STOMP_PTS = 50;
const PIZZA_PTS = 10;

// ── Jump physics (derived) ────────────────────────────────────────────────────
const MAX_JUMP_H   = (JUMP_VY * JUMP_VY) / (2 * GRAVITY);        // ≈ 95 px
const MAX_AIR_TIME = 2 * Math.abs(JUMP_VY / GRAVITY);            // ≈ 37.5 frames
const MAX_JUMP_X   = Math.floor(RUN_SPD * MAX_AIR_TIME * 0.88);  // ≈ 115 px
const JUMP_REACH   = Math.floor(MAX_JUMP_X * 0.9);               // 103 px hard gap cap

// ── Colors ────────────────────────────────────────────────────────────────────
const C_SKY    = '#5c94fc';
const C_SKY2   = '#3a78d4';
const C_PLAT_T = '#5aa02c';
const C_PLAT_B = '#8b5e00';
const C_HUD    = 'rgba(0,0,0,0.55)';

// ── State ──────────────────────────────────────────────────────────────────────
let canvas, ctx, CW, CH, FLOOR_Y;
let player, platforms, coins, enemies;
let camX, gameState;
let rafId, lastTs;
let maxGenX, playerTotalX;
let restartBtn;
let bgCrosses;

const keys = {};
const mob  = { left: false, right: false, jump: false };
let prevJump = false;

// ── Language helper ────────────────────────────────────────────────────────────
function getLang() {
    const m = document.cookie.match(/(?:^|;\s*)lang=(\w+)/);
    return (m && m[1] === 'en') ? 'en' : 'pl';
}

// ── Init ──────────────────────────────────────────────────────────────────────
function initGame() {
    canvas = document.getElementById('plat-canvas');
    ctx    = canvas.getContext('2d');

    const wrap = canvas.parentElement;
    CW = (wrap.clientWidth || Math.min(window.innerWidth - 32, 600));
    CH = Math.min(Math.round(CW * 9 / 16), 380);
    canvas.width  = CW;
    canvas.height = CH;
    FLOOR_Y = CH - FLOOR_H;

    generateLevel();
    spawnPlayer();
    camX      = 0;
    gameState = 'idle';

    ctx.fillStyle = C_SKY;
    ctx.fillRect(0, 0, CW, CH);

    if (localStorage.getItem(TUT_KEY)) {
        startGame();
    } else {
        const tut = document.getElementById('plat-tutorial');
        if (tut) tut.classList.add('active');
    }
}

function startGame() {
    cancelAnimationFrame(rafId);
    generateLevel();
    spawnPlayer();
    camX      = 0;
    gameState = 'playing';
    lastTs    = null;
    prevJump  = false;
    restartBtn = null;
    rafId = requestAnimationFrame(loop);
}

function spawnPlayer() {
    player = {
        x: 60, y: FLOOR_Y - 34,
        vx: 0, vy: 0,
        w: 22, h: 34,
        onGround: false,
        lives: 3,
        score: 0,
        invEnd: 0,
        facingRight: true,
    };
    prevJump = false;
}

// ── Platform generator constants ──────────────────────────────────────────────
const PLAT_H        = 20;
const PLAT_MIN_W    = 80;
const PLAT_MAX_W    = 140;
const GEN_CEIL_Y    = 44;
const PLAYER_H      = 34;

const _JF           = Math.abs(JUMP_VY);
const GEN_JUMP_H    = (_JF * _JF) / (2 * GRAVITY);
const GEN_JUMP_W    = (_JF / GRAVITY) * RUN_SPD;
const GEN_VERT_MAX  = Math.floor(GEN_JUMP_H * 0.85);
const GEN_HORIZ_MAX = Math.floor(GEN_JUMP_W * 0.85);

let genFrontX, genFrontY;

// ── Level generation ──────────────────────────────────────────────────────────
function generateLevel() {
    platforms    = [];
    coins        = [];
    enemies      = [];
    playerTotalX = 0;

    bgCrosses = [];
    for (let i = 0; i < 200; i++) {
        bgCrosses.push({ x: Math.random() * 20000, y: 5 + Math.random() * 280, size: 4 + Math.random() * 6 });
    }

    const startW = Math.max(Math.round(CW * 0.55), 220);
    platforms.push({ x: 0, y: FLOOR_Y, w: startW, h: FLOOR_H, moving: false, moveDir: 1, moveRange: 0, moveSpeed: 0, ox: 0 });
    genFrontX = startW;
    genFrontY = FLOOR_Y;

    extendLevel(CW * 4);
}

function extendLevel(toX) {
    while (genFrontX < toX) {
        const step = Math.min(6, Math.floor(genFrontX / (CW * 5)));

        const gap  = 10 + Math.round(Math.random() * (GEN_HORIZ_MAX - 10));
        const newX = genFrontX + gap;

        const canUp   = genFrontY - GEN_CEIL_Y;
        const canDown = FLOOR_Y   - genFrontY;
        const roll    = Math.random();
        let   newY    = genFrontY;

        if (roll < 0.40 && canUp >= 15) {
            const range = Math.min(GEN_VERT_MAX, canUp);
            newY = genFrontY - (15 + Math.round(Math.random() * (range - 15)));
        } else if (roll >= 0.65 && canDown >= 15) {
            const range = Math.min(Math.round(GEN_VERT_MAX * 1.5), canDown);
            newY = genFrontY + (15 + Math.round(Math.random() * (range - 15)));
        }
        newY = Math.max(GEN_CEIL_Y, Math.min(FLOOR_Y, newY));

        const w   = PLAT_MIN_W + Math.round(Math.random() * (PLAT_MAX_W - PLAT_MIN_W));
        const mov = newX > CW * 2 && Math.random() < 0.08 + step * 0.03;

        platforms.push({
            x: newX, y: newY, w, h: PLAT_H,
            moving:    mov,
            moveDir:   Math.random() < 0.5 ? 1 : -1,
            moveRange: mov ? 30 + Math.round(Math.random() * 40) : 0,
            moveSpeed: mov ? 1.0 + Math.random() * 0.8 + step * 0.1 : 0,
            ox: newX,
        });

        if (Math.random() < 0.65 && w >= 44) {
            coinRow(newX + 10, newY - 32, Math.max(1, Math.floor((w - 20) / 36)), 36);
        }

        if (newX > CW && w >= 80 && Math.random() < 0.12 + step * 0.04) {
            const spd = (0.9 + Math.random() * 0.5) * (1 + step * 0.1);
            enemies.push({
                x: newX + 10, y: newY - 28,
                w: 26, h: 28,
                vx: (Math.random() < 0.5 ? 1 : -1) * spd,
                alive: true,
                L: newX, R: newX + w - 26,
                color: Math.random() < 0.5 ? '#cc2200' : '#22aa22',
                rot: Math.random() * Math.PI * 2,
            });
        }

        genFrontX = newX + w;
        genFrontY = newY;
    }
    maxGenX = genFrontX;
}

function addFloor(x, w) {
    platforms.push({ x, y: FLOOR_Y, w, h: FLOOR_H, moving: false, moveDir: 1, moveRange: 0, moveSpeed: 0, ox: x });
}

function coinRow(startX, y, count, spacing) {
    for (let i = 0; i < count; i++) {
        coins.push({ x: startX + i * spacing, y, r: 10, collected: false, type: 'pizza', pts: PIZZA_PTS });
    }
}

// ── Collision ──────────────────────────────────────────────────────────────────
function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleRect(cx, cy, r, rx, ry, rw, rh) {
    const nx = Math.max(rx, Math.min(cx, rx + rw));
    const ny = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nx, dy = cy - ny;
    return dx * dx + dy * dy < r * r;
}

// ── Update ─────────────────────────────────────────────────────────────────────
function update(dt, ts) {
    for (const p of platforms) {
        if (!p.moving) continue;
        p.x += p.moveDir * p.moveSpeed * dt;
        if (p.x >= p.ox + p.moveRange) { p.x = p.ox + p.moveRange; p.moveDir = -1; }
        if (p.x <= p.ox)               { p.x = p.ox;               p.moveDir =  1; }
    }

    for (const e of enemies) {
        if (!e.alive) continue;
        e.x   += e.vx * dt;
        e.rot += 0.02 * dt;
        if (e.x <= e.L || e.x >= e.R) {
            e.vx = -e.vx;
            e.x  = Math.max(e.L, Math.min(e.R, e.x));
        }
    }

    updatePlayer(dt, ts);

    // Extend 4 viewports ahead (was 3) to maintain density
    if (player.x + CW * 3 > maxGenX) {
        extendLevel(player.x + CW * 4);
    }

    const cutoff = camX - CW * 2;
    if (cutoff > 500) {
        platforms = platforms.filter(p => p.x + p.w > cutoff);
        coins     = coins.filter(c => c.x > cutoff);
        enemies   = enemies.filter(e => e.x + e.w > cutoff);
    }
}

function updatePlayer(dt, ts) {
    let ix = 0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A'] || mob.left)  ix = -1;
    if (keys['ArrowRight'] || keys['d'] || keys['D'] || mob.right) ix =  1;
    if (ix !== 0) player.facingRight = ix > 0;
    player.vx = ix * RUN_SPD;

    const wantJump = !!(keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '] || mob.jump);
    if (wantJump && !prevJump && player.onGround) {
        player.vy = JUMP_VY;
    }
    prevJump = wantJump;

    player.vy = Math.min(player.vy + GRAVITY * dt, MAX_FALL);

    player.x += player.vx * dt;
    player.x = Math.max(0, player.x);

    if (player.x > playerTotalX) playerTotalX = player.x;

    player.onGround = false;
    player.y += player.vy * dt;

    for (const p of platforms) {
        if (!aabb(player, p)) continue;
        if (player.vy >= 0) {
            player.y = p.y - player.h;
            player.vy = 0;
            player.onGround = true;
        } else {
            player.y = p.y + p.h;
            player.vy = 0;
        }
    }

    if (player.y > CH + 80) {
        playerHit();
        return;
    }

    const invincible = ts < player.invEnd;

    if (!invincible) {
        for (const c of coins) {
            if (!c.collected && circleRect(c.x, c.y, c.r, player.x, player.y, player.w, player.h)) {
                c.collected = true;
                player.score += c.pts;
                updateHUD();
            }
        }

        for (const e of enemies) {
            if (!e.alive || !aabb(player, e)) continue;
            if (player.vy > 0 && (player.y + player.h) < (e.y + e.h * 0.55)) {
                e.alive   = false;
                player.vy = JUMP_VY * 0.55;
                player.score += STOMP_PTS;
                updateHUD();
            } else {
                playerHit();
                return;
            }
        }
    }

    const target = player.x - CW * 0.33;
    camX = Math.max(camX, Math.max(0, target));
}

function playerHit() {
    player.lives--;
    updateHUD();
    if (player.lives <= 0) {
        gameLost();
        return;
    }
    player.vx = 0;
    player.vy = 0;
    player.invEnd = performance.now() + 2200;

    // Find nearest platform visible on screen
    const screenCX = camX + CW / 2;
    let spawnPlat = null;
    let bestDist  = Infinity;
    for (const p of platforms) {
        if (p.x + p.w <= camX || p.x >= camX + CW) continue;
        const dist = Math.abs(p.x + p.w / 2 - screenCX);
        if (dist < bestDist) { bestDist = dist; spawnPlat = p; }
    }

    if (!spawnPlat) {
        // No visible platform — create one at screen centre
        const px = Math.round(camX + CW * 0.25);
        const py = Math.round(FLOOR_Y - 60);
        spawnPlat = { x: px, y: py, w: 160, h: PLAT_H, moving: false, moveDir: 1, moveRange: 0, moveSpeed: 0, ox: px };
        platforms.push(spawnPlat);
    }

    player.x = spawnPlat.x + Math.round((spawnPlat.w - player.w) / 2);
    player.y = spawnPlat.y - player.h;
    camX = Math.max(0, player.x - CW * 0.33);

    // Ensure at least one platform is reachable ahead of spawn
    const rEdge = spawnPlat.x + spawnPlat.w;
    const hasTarget = platforms.some(p => {
        if (p === spawnPlat) return false;
        const hGap = p.x - rEdge;
        if (hGap < 0 || hGap > GEN_HORIZ_MAX) return false;
        if (p.y < spawnPlat.y && spawnPlat.y - p.y > GEN_VERT_MAX) return false;
        return true;
    });

    if (!hasTarget) {
        const nx = rEdge + 15 + Math.round(Math.random() * (GEN_HORIZ_MAX - 25));
        const upRange = Math.max(0, Math.min(GEN_VERT_MAX - 20, spawnPlat.y - GEN_CEIL_Y - 20));
        let ny = spawnPlat.y - (15 + Math.round(Math.random() * upRange));
        ny = Math.max(GEN_CEIL_Y, Math.min(FLOOR_Y, ny));
        platforms.push({ x: nx, y: ny, w: PLAT_MIN_W + Math.round(Math.random() * 60), h: PLAT_H, moving: false, moveDir: 1, moveRange: 0, moveSpeed: 0, ox: nx });
    }
}

// ── Game over ──────────────────────────────────────────────────────────────────
function gameLost() {
    gameState = 'over';
    cancelAnimationFrame(rafId);

    const distM    = Math.round(playerTotalX / 10);
    const combined = player.score + distM;
    const prev     = parseInt(localStorage.getItem(HS_KEY) || '0', 10);
    if (combined > prev) {
        localStorage.setItem(HS_KEY, combined);
        const badge = document.getElementById('new-record-badge');
        if (badge) {
            badge.classList.add('new-record-show');
            setTimeout(function() { badge.classList.remove('new-record-show'); }, 3000);
        }
    }
    updateHUD();
    drawFrame(performance.now());
    drawEndOverlay();
}

function drawEndOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, CW, CH);

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.font      = 'bold ' + Math.round(CW * 0.056) + 'px monospace';
    ctx.fillStyle = '#ff4444';
    ctx.fillText('GAME OVER', CW / 2, CH * 0.26);

    const distM    = Math.round(playerTotalX / 10);
    const savedLbl = getLang() === 'en' ? 'SAVED: ' : 'URATOWANO: ';
    ctx.font      = Math.round(CW * 0.033) + 'px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(savedLbl + String(player.score).padStart(5, '0'), CW / 2, CH * 0.40);
    ctx.fillText('DIST:  ' + distM + ' m',                         CW / 2, CH * 0.50);

    const bw = Math.round(CW * 0.42), bh = 44;
    const bx = CW / 2 - bw / 2, by = CH * 0.64;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle   = '#fff';
    ctx.font        = Math.round(CW * 0.031) + 'px monospace';
    ctx.fillText('[ PLAY AGAIN ]', CW / 2, by + bh / 2);
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';

    restartBtn = { x: bx, y: by, w: bw, h: bh };
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawFrame(ts) {
    const grad = ctx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, C_SKY2);
    grad.addColorStop(1, C_SKY);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);

    drawBgCrosses();

    ctx.save();
    ctx.translate(-Math.round(camX), 0);

    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawPlayer(ts);

    ctx.restore();
    drawHUD();
}

function drawBgCrosses() {
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    for (const c of bgCrosses) {
        const sx = c.x - camX;
        if (sx < -16 || sx > CW + 16) continue;
        const s = c.size;
        const t = Math.max(1, Math.round(s * 0.3));
        ctx.fillRect(sx - s, c.y - t, s * 2, t * 2);
        ctx.fillRect(sx - t, c.y - s, t * 2, s * 2);
    }
}

function drawPlatforms() {
    for (const p of platforms) {
        if (p.x + p.w < camX - 4 || p.x > camX + CW + 4) continue;
        ctx.fillStyle = C_PLAT_T;
        ctx.fillRect(p.x, p.y, p.w, Math.min(14, p.h));
        if (p.h > 14) {
            ctx.fillStyle = C_PLAT_B;
            ctx.fillRect(p.x, p.y + 14, p.w, p.h - 14);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(p.x, p.y, p.w, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(p.x, p.y, 3, p.h);
    }
}

function drawCoins() {
    for (const c of coins) {
        if (c.collected) continue;
        if (c.x < camX - 24 || c.x > camX + CW + 24) continue;
        drawPizza(c.x, c.y);
    }
}

function drawPizza(x, y) {
    ctx.fillStyle = '#f8c800';
    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x + 10, y + 7);
    ctx.lineTo(x - 10, y + 7);
    ctx.closePath();
    ctx.fill();
    // Crust
    ctx.strokeStyle = '#c8800a';
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 7);
    ctx.lineTo(x - 10, y + 7);
    ctx.stroke();
    // Toppings
    ctx.fillStyle = '#cc2200';
    ctx.beginPath(); ctx.arc(x,     y + 1, 2,   0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 4, y + 5, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 4, y + 5, 1.5, 0, Math.PI * 2); ctx.fill();
}

function drawEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;
        if (e.x + e.w < camX - 20 || e.x > camX + CW + 20) continue;
        drawVirus(e.x + e.w / 2, e.y + e.h / 2, 10, e.color, e.rot);
    }
}

function drawVirus(cx, cy, r, color, rot) {
    const SPIKES = 8;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    for (let i = 0; i < SPIKES; i++) {
        const angle = rot + (i / SPIKES) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r,       cy + Math.sin(angle) * r);
        ctx.lineTo(cx + Math.cos(angle) * (r + 6), cy + Math.sin(angle) * (r + 6));
        ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 3, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(cx - 2.5, cy - 2, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 3.5, cy - 2, 1.5, 0, Math.PI * 2); ctx.fill();
}

function drawPlayer(ts) {
    const p = player;
    if (ts < p.invEnd && Math.floor(ts / 100) % 2 === 0) return;

    const px = Math.round(p.x);
    const py = Math.round(p.y);
    const fr = p.facingRight;

    const legPhase = Math.floor(ts / 150) % 2;
    const moving   = Math.abs(p.vx) > 0.1;
    const lyL = moving ? (legPhase === 0 ? 0 : 4) : 2;
    const lyR = moving ? (legPhase === 0 ? 4 : 0) : 2;
    ctx.fillStyle = '#1a4ab0';
    ctx.fillRect(px + 2,       py + p.h + lyL - 2, 7, 8);
    ctx.fillRect(px + p.w - 9, py + p.h + lyR - 2, 7, 8);

    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(px, py + 12, p.w, p.h - 12);

    const bx = px + Math.round(p.w / 2);
    const by = py + 22;
    ctx.fillStyle = '#1155cc';
    ctx.fillRect(bx - 5, by - 2, 10, 4);
    ctx.fillRect(bx - 2, by - 5, 4, 10);

    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(px + 4, py + 5, p.w - 8, 12);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 1, py, p.w + 2, 8);
    ctx.fillRect(px - 3, py + 5, p.w + 6, 4);
    const capCX = px + Math.round(p.w / 2);
    ctx.fillStyle = '#dd2222';
    ctx.fillRect(capCX - 4, py + 1, 8, 3);
    ctx.fillRect(capCX - 1, py - 2, 3, 8);

    ctx.fillStyle = '#333';
    ctx.fillRect(fr ? px + p.w - 7 : px + 3, py + 9, 3, 3);
}

function drawHUD() {
    ctx.fillStyle = C_HUD;
    ctx.fillRect(0, 0, CW, 36);

    const fontSize = Math.round(CW * 0.029);
    ctx.font         = 'bold ' + fontSize + 'px monospace';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ff5577';
    for (let i = 0; i < player.lives; i++) {
        ctx.fillText('♥', 8 + i * (fontSize + 4), 18);
    }

    const savedLbl = getLang() === 'en' ? 'SAVED: ' : 'URATOWANO: ';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(savedLbl + String(player.score).padStart(5, '0'), CW / 2, 18);

    const distM = Math.round(playerTotalX / 10);
    ctx.textAlign = 'right';
    ctx.fillText(distM + ' m', CW - 8, 18);

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

// ── HUD (HTML elements) ────────────────────────────────────────────────────────
function updateHUD() {
    const sc = document.getElementById('session-score');
    if (sc) sc.textContent = player ? player.score : 0;
    const hs = document.getElementById('high-score');
    if (hs) hs.textContent = localStorage.getItem(HS_KEY) || 0;
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

// ── Keyboard ──────────────────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    if (gameState === 'over' &&
        (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'r')) {
        startGame();
    }
});

document.addEventListener('keyup', function(e) {
    delete keys[e.key];
});

// ── Canvas click / touch ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const cvs = document.getElementById('plat-canvas');
    if (!cvs) return;

    function tryRestart(clientX, clientY) {
        if (gameState !== 'over' || !restartBtn) return;
        const rect = cvs.getBoundingClientRect();
        const cx   = (clientX - rect.left) * (CW / rect.width);
        const cy   = (clientY - rect.top)  * (CH / rect.height);
        const b    = restartBtn;
        if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) startGame();
    }

    cvs.addEventListener('click', e => tryRestart(e.clientX, e.clientY));

    cvs.addEventListener('touchend', function(e) {
        if (gameState !== 'over' || !restartBtn) return;
        e.preventDefault();
        const t = e.changedTouches[0];
        tryRestart(t.clientX, t.clientY);
    }, { passive: false });

    const btnStart = document.getElementById('btn-plat-start');
    if (btnStart) {
        btnStart.addEventListener('click', function() {
            localStorage.setItem(TUT_KEY, '1');
            const tut = document.getElementById('plat-tutorial');
            if (tut) tut.classList.remove('active');
            startGame();
        });
    }

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) btnRestart.addEventListener('click', startGame);

    function bindBtn(id, key) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('touchstart', function(e) { e.preventDefault(); mob[key] = true;  }, { passive: false });
        el.addEventListener('touchend',   function(e) { e.preventDefault(); mob[key] = false; }, { passive: false });
        el.addEventListener('touchcancel',function(e) { e.preventDefault(); mob[key] = false; }, { passive: false });
        el.addEventListener('mousedown',  function()  { mob[key] = true;  });
        el.addEventListener('mouseup',    function()  { mob[key] = false; });
        el.addEventListener('mouseleave', function()  { mob[key] = false; });
    }

    bindBtn('btn-plat-left',  'left');
    bindBtn('btn-plat-right', 'right');
    bindBtn('btn-plat-jump',  'jump');
});
