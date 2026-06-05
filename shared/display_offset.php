<?php
// ── HISTORICAL DISPLAY OFFSET — core.helpbyplay.com only ──────────────────────
// Adds v0.9 platform data (Dec 2022 – Jun 2023) to public-facing totals.
// Affects: site header stats, post-game session summary.
// Does NOT affect: session recording, earned_pln, DB values, analytics queries.
//
// To remove when deploying a new NGO instance:
//   1. Delete this file.
//   2. Remove require_once for this file from shared/layout.php and api/stats.php.
// ──────────────────────────────────────────────────────────────────────────────
const DISPLAY_SESSIONS_OFFSET = 1500;
const DISPLAY_PLN_OFFSET      = 3030.82;
