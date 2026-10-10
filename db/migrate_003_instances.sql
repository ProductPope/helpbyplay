-- Migration 003 — instances table for the hub counter (core.helpbyplay.com)
-- Run once via phpMyAdmin. Needed only on the hub; harmless (empty) on any other instance.

CREATE TABLE IF NOT EXISTS instances (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name          VARCHAR(255)  NOT NULL,              -- charity name shown on the hub stats page
    stats_url     VARCHAR(255)  NOT NULL,              -- e.g. https://play.charity.org/api/stats.php
    active        TINYINT(1)    NOT NULL DEFAULT 1,    -- 0 = excluded from the main counter
    last_sessions INT UNSIGNED  NOT NULL DEFAULT 0,    -- last known own totals of the instance,
    last_pln      DECIMAL(14,4) NOT NULL DEFAULT 0.0000, -- kept when the instance is unreachable
    last_ok_at    DATETIME      NULL,                  -- last successful sync
    last_error    VARCHAR(255)  NULL,                  -- last sync failure, NULL after a success
    PRIMARY KEY (id),
    UNIQUE KEY uq_stats_url (stats_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add each charity instance (one row per instance, not core itself), e.g.:
-- INSERT INTO instances (name, stats_url) VALUES ('Charity Name', 'https://play.charity.org/api/stats.php');
