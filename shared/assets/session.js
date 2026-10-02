// Session lifecycle — device identity, API calls, screen routing.
// Load order: counter.js → game.js (defines GAME_CONFIG + initGame) → session.js
// All API paths are root-relative so they work from any subdirectory depth.

const HEARTBEAT_INTERVAL_MS = 30000; // wall-clock keepalive; server closes sessions silent for 15 min

let memoryDeviceId = null; // fallback when localStorage is blocked (private mode, strict cookies)

function newUuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function getDeviceId() {
    try {
        let id = localStorage.getItem('hbp_device_id');
        if (!id) {
            id = newUuid();
            localStorage.setItem('hbp_device_id', id);
        }
        return id;
    } catch (e) {
        if (!memoryDeviceId) memoryDeviceId = newUuid();
        return memoryDeviceId;
    }
}

let sessionId    = null;
let sessionToken = null;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Takes ownership of the current session so no other path (beacon, heartbeat) reuses it.
function takeSession() {
    const s = { session_id: sessionId, token: sessionToken };
    sessionId    = null;
    sessionToken = null;
    return s;
}

async function postEnd(session, type) {
    const res = await fetch('/api/session_end.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session_id:   session.session_id,
            token:        session.token,
            duration_sec: getSessionSeconds(),
            type:         type,
        }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

function sendBeacon(session, type) {
    navigator.sendBeacon('/api/session_end.php', new URLSearchParams({
        session_id:   session.session_id,
        token:        session.token,
        duration_sec: getSessionSeconds(),
        type:         type,
    }));
}

async function startSession() {
    try {
        const res  = await fetch('/api/session_start.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ device_id: getDeviceId() }),
        });
        const data = await res.json();
        if (!data.session_id || !data.token) throw new Error('no session');
        sessionId    = data.session_id;
        sessionToken = data.token;
        showScreen('screen-game');
        initGame();
        startCounter();
    } catch (e) {
        showScreen('screen-error');
    }
}

function formatPln(value, decimals) {
    const lang = document.documentElement.lang || 'pl';
    return new Intl.NumberFormat(lang, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value) + ' PLN';
}

// Player clicked "Finish" — close the session and show the summary
async function endSession() {
    if (!sessionId) return;
    stopCounter();

    const seconds = getSessionSeconds();
    document.getElementById('sum-duration').textContent = formatDuration(seconds);
    document.getElementById('sum-earned').textContent   = formatPln(getSessionEarned(), 4);

    try {
        const data = await postEnd(takeSession(), 'end');
        document.getElementById('sum-global').textContent = formatPln(data.total_pln, 2);
    } catch (e) {
        // Session time is still saved by the last heartbeat and the server sweep
    }

    showScreen('screen-summary');
}

async function autoEndSession() {
    if (!sessionId) return;
    stopCounter();
    try {
        await postEnd(takeSession(), 'end');
    } catch (e) {
        // Last heartbeat + server sweep will close the session
    }
    showScreen('screen-inactivity');
}

// Save progress on tab switch (no ended_at, no stats update)
function sendBeaconSave() {
    if (!sessionId) return;
    sendBeacon({ session_id: sessionId, token: sessionToken }, 'heartbeat');
}

// Finalize session on tab close / navigation. pagehide fires reliably on mobile,
// unlike beforeunload; if the OS kills the tab without either, the server sweep
// closes the session using the last heartbeat.
function sendBeaconEnd() {
    if (!sessionId) return;
    stopCounter();
    sendBeacon(takeSession(), 'beacon');
}

// Wall-clock keepalive — also covers time spent waiting for an ad, when the
// counter is not ticking but the session is still alive
setInterval(() => {
    if (!sessionId || document.visibilityState !== 'visible') return;
    postEnd({ session_id: sessionId, token: sessionToken }, 'heartbeat').catch(() => {});
}, HEARTBEAT_INTERVAL_MS);

// Auto-end after 600s of inactivity
document.addEventListener('counter:inactivity-timeout', () => autoEndSession());

// Save on tab switch; end on close / navigate away
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendBeaconSave();
});
window.addEventListener('pagehide', sendBeaconEnd);

// Page restored from back/forward cache: its session was already ended on pagehide
window.addEventListener('pageshow', (e) => {
    if (e.persisted) location.reload();
});

const btnEnd = document.getElementById('btn-end-session');
if (btnEnd) btnEnd.addEventListener('click', endSession);

// Boot
startSession();
