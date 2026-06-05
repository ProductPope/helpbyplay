// Client-side session earnings counter.
// Rate: 0.001 PLN per 10 seconds = 0.0001 PLN per second.
// Pauses after 10s of inactivity. Dispatches auto-end after 600s inactivity.
// Dispatches heartbeat every 30 active seconds.
// For AdSense provider: pauses until ad fills (checked every 5s).
// For other providers (custom, placeholder): counter runs without ad gate.

const PLN_PER_SECOND         = 0.0001;
const INACTIVITY_PAUSE_MS    = 10000;   // 10s  → pause counter + grey display
const INACTIVITY_AUTO_END_MS = 600000;  // 600s → dispatch auto-end event
const AD_CHECK_INTERVAL_MS   = 5000;   // 5s   → re-check ad visibility
const AD_WAIT_MSG_DELAY_MS   = 3000;   // 3s   → show "waiting for ad" msg

let sessionSeconds       = 0;
let tickInterval         = null;
let paused               = false;
let inactivityPauseTimer = null;
let inactivityEndTimer   = null;
let adPresentCache       = false;
let adCheckInterval      = null;
let adWaitMsgTimer       = null;

function isAdVisible() {
    const ins = document.querySelector('ins.adsbygoogle');
    if (!ins) return true;  // non-AdSense provider — no ad gate
    const status = ins.getAttribute('data-ad-status');
    if (status === 'filled')   return true;
    if (status === 'unfilled') return false;
    return false; // AdSense still loading
}

function setAdWaitMsg(visible) {
    const el = document.getElementById('ad-wait-msg');
    if (!el) return;
    el.style.opacity = visible ? '1' : '0';
}

function scheduleAdWaitMsg() {
    if (adWaitMsgTimer) return;
    adWaitMsgTimer = setTimeout(function() {
        adWaitMsgTimer = null;
        if (!adPresentCache && !paused) setAdWaitMsg(true);
    }, AD_WAIT_MSG_DELAY_MS);
}

function cancelAdWaitMsg() {
    clearTimeout(adWaitMsgTimer);
    adWaitMsgTimer = null;
    setAdWaitMsg(false);
}

function updateAdCheck() {
    const visible = isAdVisible();
    adPresentCache = visible;
    if (visible) {
        cancelAdWaitMsg();
    } else if (!paused) {
        scheduleAdWaitMsg();
    }
}

function startCounter() {
    if (tickInterval) return;
    adPresentCache  = isAdVisible();
    tickInterval    = setInterval(tick, 1000);
    adCheckInterval = setInterval(updateAdCheck, AD_CHECK_INTERVAL_MS);
    if (!adPresentCache) scheduleAdWaitMsg();
    resetInactivityTimer();
    document.addEventListener('click',      resetInactivityTimer, { passive: true });
    document.addEventListener('touchstart', resetInactivityTimer, { passive: true });
    document.addEventListener('mousemove',  resetInactivityTimer, { passive: true });
    document.addEventListener('keydown',    resetInactivityTimer, { passive: true });
}

function stopCounter() {
    clearInterval(tickInterval);
    clearInterval(adCheckInterval);
    clearTimeout(inactivityPauseTimer);
    clearTimeout(inactivityEndTimer);
    cancelAdWaitMsg();
    tickInterval    = null;
    adCheckInterval = null;
    document.removeEventListener('click',      resetInactivityTimer);
    document.removeEventListener('touchstart', resetInactivityTimer);
    document.removeEventListener('mousemove',  resetInactivityTimer);
    document.removeEventListener('keydown',    resetInactivityTimer);
    setPaused(false);
}

function tick() {
    if (paused || !adPresentCache) return;
    sessionSeconds++;
    refreshDisplay();
    if (sessionSeconds % 30 === 0) {
        document.dispatchEvent(new CustomEvent('counter:heartbeat', {
            detail: { seconds: sessionSeconds },
        }));
    }
}

function resetInactivityTimer() {
    if (paused) setPaused(false);
    clearTimeout(inactivityPauseTimer);
    clearTimeout(inactivityEndTimer);
    inactivityPauseTimer = setTimeout(() => setPaused(true), INACTIVITY_PAUSE_MS);
    inactivityEndTimer   = setTimeout(
        () => document.dispatchEvent(new CustomEvent('counter:inactivity-timeout')),
        INACTIVITY_AUTO_END_MS
    );
}

function setPaused(val) {
    paused = val;
    const el = document.getElementById('session-counter');
    if (el) el.classList.toggle('counter-paused', val);
    if (val) {
        // inactivity pause: hide ad-wait-msg (different pause reason)
        cancelAdWaitMsg();
    } else if (!adPresentCache) {
        // became active again but still no ad: restart wait msg timer
        scheduleAdWaitMsg();
    }
}

function refreshDisplay() {
    const earned = sessionSeconds * PLN_PER_SECOND;
    const el = document.getElementById('session-counter');
    if (el) el.textContent = earned.toFixed(4) + ' PLN';

    const timeEl = document.getElementById('session-time');
    if (timeEl) timeEl.textContent = formatDuration(sessionSeconds);
}

function formatDuration(sec) {
    if (sec < 60) return sec + ' s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ' min ' + (s > 0 ? s + ' s' : '');
}

function getSessionSeconds() {
    return sessionSeconds;
}

function getSessionEarned() {
    return parseFloat((sessionSeconds * PLN_PER_SECOND).toFixed(4));
}
