<?php
// ── HISTORICAL DISPLAY OFFSET — core.helpbyplay.com only ──────────────────────
// Adds v0.9 platform data (Dec 2022 – Jun 2023) to public-facing totals.
// Affects: site header stats, post-game session summary.
// Does NOT affect: session recording, earned_pln, DB values, analytics queries.
//
// When deploying a new NGO instance: set both constants below to 0.
// Do NOT delete this file — the constants are used by shared/layout.php,
// index.php, and api/stats.php.
// ──────────────────────────────────────────────────────────────────────────────
const DISPLAY_SESSIONS_OFFSET = 1500;
const DISPLAY_PLN_OFFSET      = 3030.82;
