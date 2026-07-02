# Installing Help By Play on your own server

Step-by-step guide for self-hosting a Help By Play instance. One instance serves one charity on one domain (or subdomain).

Works on any standard PHP shared hosting (Apache + PHP + MySQL) — no root access, Composer, or build tools required.

---

## Requirements

- PHP 8.1 or newer, with the PDO MySQL extension (standard on shared hosting)
- MySQL / MariaDB 10.4 or newer
- A domain or subdomain with its document root pointed at the instance directory
- FTP or file-manager access to the server

No external libraries, no npm, no Composer — the project is plain PHP, vanilla JS, and CSS.

---

## Step 1 — Get the files

Download the repository:

```
git clone https://github.com/ProductPope/helpbyplay.git
```

or download the ZIP from GitHub and unpack it.

---

## Step 2 — Create the database

1. Create an empty MySQL database and a database user with full rights to it (on shared hosting: hosting panel → MySQL Management).
2. Note down: database name, username, password, host (usually `localhost`).
3. Import the schema: open phpMyAdmin → select the database → **Import** → choose `db/init.sql` → **Go**.

Verify two tables exist: `sessions` and `stats`. The `stats` table must contain one row with `id = 1` (created automatically by the script).

> `db/migrate_001_device_id.sql` is only for upgrading old installations — skip it for a fresh install.

---

## Step 3 — Create config.php

Copy `config.example.php` to `config.php` in the project root and fill it in:

```php
// Database — from step 2
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Charity shown on the home screen
define('FOUNDATION_NAME', 'Full Charity Name');
define('FOUNDATION_DESC', 'Short mission description.');
define('FOUNDATION_LOGO', '');            // logo URL or leave empty

define('DEFAULT_LANG', 'pl');             // 'pl' or 'en'

// Ads — leave AD_PROVIDER empty at launch (placeholder shown instead of ads)
define('AD_PROVIDER', '');
define('ADSENSE_CLIENT', '');
define('ADSENSE_SLOT',   '');
define('AD_CUSTOM_HTML_MOBILE',  '');
define('AD_CUSTOM_HTML_DESKTOP', '');
```

`config.php` is listed in `.gitignore` and must never be committed.

---

## Step 4 — Reset the historical display offset

The repository ships with a display offset used only by the original `core.helpbyplay.com` instance (it adds historical v0.9 platform data to the public counters).

For your own instance, open `shared/display_offset.php` and set both constants to zero:

```php
const DISPLAY_SESSIONS_OFFSET = 0;
const DISPLAY_PLN_OFFSET      = 0;
```

Do **not** delete the file — the constants are used by `shared/layout.php`, `index.php`, and `api/stats.php`.

---

## Step 5 — Replace ads.txt

The repository's `ads.txt` contains the publisher ID of the original instance. Replace its contents with your own AdSense line:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

If you don't have an approved AdSense account yet, delete the file for now and add it once approved.

---

## Step 6 — Upload to the server

1. Upload all project files to your domain's document root (e.g. `public_html/`), **including** the `config.php` you created.
2. Do not upload the `.git` directory (irrelevant on the server).
3. Directory layout on the server must match the repository — the app uses root-relative paths (`/api/...`, `/shared/...`, `/games/...`), so it must live at the domain root, **not** in a subdirectory like `example.org/hbp/`.

If you use a subdomain (`play.example.org`), point the subdomain's document root at the instance directory in your hosting panel.

---

## Step 7 — Verify the installation

Open your domain and run through the checklist:

- [ ] Home screen loads with the charity name, description, and game tiles
- [ ] Header stats show `0 · 0 PLN` (fresh database)
- [ ] Opening any game starts a session and the earnings counter ticks
- [ ] Leaving the game / closing the tab ends the session
- [ ] Home screen counter increased after the session
- [ ] Stats page (`/statystyki.php`) shows today / this week / all-time numbers
- [ ] PL/EN switcher in the footer works
- [ ] Everything works on a phone (360 px viewport, no horizontal scroll)

If the counter stays at zero, check `config.php` database credentials — DB errors degrade silently to zeros by design.

---

## Step 8 — Activate real ads (later)

Ads are gated behind cookie consent and disabled until configured. When your AdSense account is approved, edit `config.php`:

```php
define('AD_PROVIDER', 'adsense');
define('ADSENSE_CLIENT', 'ca-pub-XXXXXXXXXXXXXXXX');  // publisher ID
define('ADSENSE_SLOT',   '1234567890');               // ad unit slot ID
```

Alternatively, for a directly-sold creative:

```php
define('AD_PROVIDER', 'custom');
define('AD_CUSTOM_HTML_MOBILE',  '<raw HTML, 320x100>');
define('AD_CUSTOM_HTML_DESKTOP', '<raw HTML, 728x90>');
```

No template changes needed — `shared/ads.php` renders the right variant automatically.

---

## Updating an existing installation

1. Upload the changed files over the old ones — **never overwrite `config.php`, `ads.txt`, or `shared/display_offset.php`**.
2. If the release notes mention a new file in `db/` named `migrate_*.sql`, run it once via phpMyAdmin.
3. Re-run the verification checklist from step 7.

---

## License

GPL v3 — any charity may fork and self-host. See [LICENSE](LICENSE).
