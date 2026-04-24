-- Help By Play — database schema
-- Run once via phpMyAdmin on Cyberfolks

CREATE TABLE IF NOT EXISTS sessions (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    device_id    VARCHAR(36)   NULL,
    started_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at     DATETIME      NULL,
    duration_sec INT UNSIGNED  NOT NULL DEFAULT 0,
    earned_pln   DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    PRIMARY KEY (id),
    INDEX idx_device_id (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stats (
    id             INT UNSIGNED  NOT NULL DEFAULT 1,
    total_sessions INT UNSIGNED  NOT NULL DEFAULT 0,
    total_pln      DECIMAL(14,4) NOT NULL DEFAULT 0.0000,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Single stats row — always exists
INSERT IGNORE INTO stats (id, total_sessions, total_pln) VALUES (1, 0, 0.0000);
