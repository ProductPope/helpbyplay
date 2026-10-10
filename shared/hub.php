<?php
// Hub totals — the main counter of the whole initiative.
// core.helpbyplay.com (HBP_IS_HUB = true) adds the last known totals of every
// charity instance, collected by cron/sync_instances.php into the instances table.
// On a regular instance the hub part is always zero.
// Requires config.php loaded first.

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/display_offset.php';

// Sum of the cached totals of all active instances (zeros when not a hub).
// Cached per request; DB errors degrade to zeros like the rest of the stats.
function hbp_hub_totals(): array {
    static $totals = null;
    if ($totals !== null) return $totals;

    $totals = ['sessions' => 0, 'pln' => 0.0];
    if (!HBP_IS_HUB) return $totals;

    try {
        $row = hbp_db()->query(
            'SELECT COALESCE(SUM(last_sessions), 0) AS s, COALESCE(SUM(last_pln), 0) AS p
               FROM instances WHERE active = 1'
        )->fetch(PDO::FETCH_ASSOC);
        $totals = ['sessions' => (int) $row['s'], 'pln' => (float) $row['p']];
    } catch (PDOException $e) {
        error_log('HBP hub totals: ' . $e->getMessage());
    }
    return $totals;
}

// Public-facing totals: this instance's own DB totals + v0.9 offset + other instances (hub only).
// Never used for session recording or earned_pln.
function hbp_display_sessions(int $ownSessions): int {
    return $ownSessions + DISPLAY_SESSIONS_OFFSET + hbp_hub_totals()['sessions'];
}

function hbp_display_pln(float $ownPln): float {
    return $ownPln + DISPLAY_PLN_OFFSET + hbp_hub_totals()['pln'];
}
