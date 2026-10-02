-- Migration 002 — session ownership token, rate limiting, stale-session sweep
-- Run once via phpMyAdmin on existing installations, BEFORE uploading the new PHP files.

ALTER TABLE sessions
    ADD COLUMN token        CHAR(32) NULL AFTER device_id,
    ADD COLUMN ip_hash      CHAR(64) NULL AFTER token,
    ADD COLUMN last_seen_at DATETIME NULL AFTER started_at,
    ADD INDEX  idx_started_at (started_at),
    ADD INDEX  idx_open (ended_at, last_seen_at),
    ADD INDEX  idx_ip_started (ip_hash, started_at);

-- Legacy sessions that never received an end signal: close them WITHOUT adding
-- to the global total, so the public counter does not jump after the upgrade.
-- (To credit them instead, skip this statement — the server sweep will then
-- add their last heartbeat duration to stats.total_pln.)
UPDATE sessions
   SET ended_at   = DATE_ADD(started_at, INTERVAL duration_sec SECOND),
       earned_pln = ROUND(LEAST(duration_sec, 3600) * 0.0001, 4)
 WHERE ended_at IS NULL;
