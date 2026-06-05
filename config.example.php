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
