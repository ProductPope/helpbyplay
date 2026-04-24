// Session lifecycle — device identity, API calls, screen routing.
// Load order: counter.js → game.js (defines GAME_CONFIG + initGame) → session.js
// All API paths are root-relative so they work from any subdirectory depth.

function getDeviceId() {
    let id = localStorage.getItem('hbp_device_id');
    if (!id) {
        if (crypto.randomUUID) {
            id = crypto.randomUUID();
        } else {
            id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }
        localStorage.setItem('hbp_device_id', id);
    }
    return id;
}

let sessionId = null;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

async function startSession() {
    try {
        const res  = await fetch('/api/session_start.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ device_id: getDeviceId() }),
        });
        const data = await res.json();
        if (!data.session_id) throw new Error('no session_id');
        sessionId = data.session_id;
        showScreen('screen-game');
        initGame();
        startCounter();
    } catch (e) {
        showScreen('screen-error');
    }
}

async function autoEndSession() {
    if (!sessionId) return;
    stopCounter();

    const sid = sessionId;
    sessionId  = null;
    const dur  = getSessionSeconds();

    try {
        await fetch('/api/session_end.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ session_id: sid, duration_sec: dur, type: 'end' }),
        });
    } catch (e) {
        // beacon on unload will save if this fails
    }

    showScreen('screen-inactivity');
}

// Save progress on tab switch (no ended_at, no stats update)
function sendBeaconSave() {
    if (!sessionId) return;
    navigator.sendBeacon('/api/session_end.php', new URLSearchParams({
        session_id:   sessionId,
        duration_sec: getSessionSeconds(),
        type:         'heartbeat',
    }));
}

// Finalize session on browser close / navigation
function sendBeaconEnd() {
    if (!sessionId) return;
    const sid = sessionId;
    sessionId  = null;
    navigator.sendBeacon('/api/session_end.php', new URLSearchParams({
        session_id:   sid,
        duration_sec: getSessionSeconds(),
        type:         'beacon',
    }));
}

// Heartbeat every 30 active seconds
document.addEventListener('counter:heartbeat', (e) => {
    if (!sessionId) return;
    fetch('/api/session_end.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session_id:   sessionId,
            duration_sec: e.detail.seconds,
            type:         'heartbeat',
        }),
    }).catch(() => {});
});

// Auto-end after 600s of inactivity
document.addEventListener('counter:inactivity-timeout', () => autoEndSession());

// Save on tab switch; end on close / navigate away
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendBeaconSave();
});
window.addEventListener('beforeunload', sendBeaconEnd);

// Boot
startSession();
