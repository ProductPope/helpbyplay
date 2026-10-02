<?php
// Copy this file to config.php and fill in your values.
// config.php must NEVER be committed to git.

// --- Database (get these from DirectAdmin → MySQL Databases) ---
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// --- Foundation info (shown on the start screen) ---
define('FOUNDATION_NAME', 'Your Foundation Name');
define('FOUNDATION_DESC', 'Short description of the foundation mission — shown below the name on the home screen.');
define('FOUNDATION_LOGO', '');   // URL or path to logo, e.g. 'assets/logo.png'. Leave empty if none.

// --- Default language: 'pl' or 'en' ---
define('DEFAULT_LANG', 'pl');

// --- Ads ---
// AD_PROVIDER: 'adsense' | 'custom' | '' (empty = placeholder only)
define('AD_PROVIDER', '');

// AdSense (used when AD_PROVIDER = 'adsense')
define('ADSENSE_CLIENT', '');    // e.g. 'ca-pub-0000000000000000'
define('ADSENSE_SLOT',   '');    // e.g. '1234567890'

// Custom creative (used when AD_PROVIDER = 'custom')
// Paste the raw HTML snippet from the advertiser. Mobile: 320x100. Desktop: 728x90.
define('AD_CUSTOM_HTML_MOBILE',  '');
define('AD_CUSTOM_HTML_DESKTOP', '');

// --- Historical data (core.helpbyplay.com only) ---
// A new charity instance keeps these at 0 / false.
// core.helpbyplay.com adds its v0.9 totals (Dec 2022 – Jun 2023):
//   DISPLAY_SESSIONS_OFFSET = 1500, DISPLAY_PLN_OFFSET = 3030.82, SHOW_V09_HISTORY = true
define('DISPLAY_SESSIONS_OFFSET', 0);
define('DISPLAY_PLN_OFFSET',      0);
define('SHOW_V09_HISTORY',        false); // show the v0.9 section on the stats page
