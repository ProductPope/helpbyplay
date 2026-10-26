-- Help By Play — database schema
-- Run once via phpMyAdmin on Cyberfolks

CREATE TABLE IF NOT EXISTS sessions (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    device_id    VARCHAR(36)   NULL,
    token        CHAR(32)      NULL,      -- secret proving session ownership
    ip_hash      CHAR(64)      NULL,      -- HMAC of client IP, rate limiting only
    started_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME      NULL,      -- last heartbeat; stale sessions are closed by the server
    ended_at     DATETIME      NULL,
    duration_sec INT UNSIGNED  NOT NULL DEFAULT 0,
    earned_pln   DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    PRIMARY KEY (id),
    INDEX idx_device_id (device_id),
    INDEX idx_started_at (started_at),
    INDEX idx_open (ended_at, last_seen_at),
    INDEX idx_ip_started (ip_hash, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stats (
    id             INT UNSIGNED  NOT NULL DEFAULT 1,
    -- total_sessions counts unique device_ids with at least one completed session,
    -- NOT total session count. Incremented once per device on first completion.
    -- TODO: rename to total_players for clarity (requires ALTER TABLE migration).
    total_sessions INT UNSIGNED  NOT NULL DEFAULT 0,
    total_pln      DECIMAL(14,4) NOT NULL DEFAULT 0.0000,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Single stats row — always exists
INSERT IGNORE INTO stats (id, total_sessions, total_pln) VALUES (1, 0, 0.0000);

-- Hub counter (core.helpbyplay.com only): last known totals of every charity instance,
-- filled by cron/sync_instances.php. Stays empty on a regular instance.
CREATE TABLE IF NOT EXISTS instances (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name          VARCHAR(255)  NOT NULL,
    stats_url     VARCHAR(255)  NOT NULL,
    active        TINYINT(1)    NOT NULL DEFAULT 1,
    last_sessions INT UNSIGNED  NOT NULL DEFAULT 0,
    last_pln      DECIMAL(14,4) NOT NULL DEFAULT 0.0000,
    last_ok_at    DATETIME      NULL,
    last_error    VARCHAR(255)  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_stats_url (stats_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
