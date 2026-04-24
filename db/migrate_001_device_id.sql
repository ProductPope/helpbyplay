-- Migration 001 — add device_id to sessions
-- Run once via phpMyAdmin on existing installations

ALTER TABLE sessions
    ADD COLUMN device_id VARCHAR(36) NULL AFTER id,
    ADD INDEX  idx_device_id (device_id);
