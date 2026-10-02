<?php
// Historical display offset — fallback defaults.
// The real values live in config.php (see config.example.php), so this file
// is identical on every instance and can be overwritten safely on upgrade.
// Affects only public-facing totals (header, home stats bar, post-game summary),
// never session recording, earned_pln or DB values.
if (!defined('DISPLAY_SESSIONS_OFFSET')) define('DISPLAY_SESSIONS_OFFSET', 0);
if (!defined('DISPLAY_PLN_OFFSET'))      define('DISPLAY_PLN_OFFSET', 0.0);
if (!defined('SHOW_V09_HISTORY'))        define('SHOW_V09_HISTORY', false);
