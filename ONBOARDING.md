# Onboarding a new charity — platform owner guide

Steps the platform owner takes when adding a new charity to Help By Play.

---

## Prerequisites

- The charity has completed both their steps: DNS record added, AdSense account created
- Access to the Cyberfolks server (SSH or FTP + DirectAdmin panel)
- Charity's AdSense publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`) and ad slot ID

---

## Step 1 — Create a database for the charity

1. Log in to DirectAdmin → **MySQL Management**
2. Click **Create new database**
3. Note down:
   - Database name (e.g. `user123_charity_abc`)
   - Database username
   - Password

---

## Step 2 — Import the database schema

1. Open **phpMyAdmin** in DirectAdmin
2. Select the newly created database
3. Go to **Import** tab → select `db/init.sql` → click **Go**

Verify that two tables were created: `sessions` and `stats`.

---

## Step 3 — Create the instance directory on the server

Each charity gets its own directory inside `public_html`, served via a virtual host or Apache subdirectory directive.

Example structure:

```
public_html/
├── charity-abc/           ← this charity's instance directory
│   ├── index.php
│   ├── game.php
│   ├── config.php         ← filled with this charity's data
│   ├── lang.php
│   ├── api/
│   ├── assets/
│   └── db/
```

Copy all project files into the new directory (without `config.php` — you'll create that next).

---

## Step 4 — Create config.php for this charity

Create `config.php` in the instance directory:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'user123_charity_abc');   // database from step 1
define('DB_USER', 'user123_abc');
define('DB_PASS', 'database_password');

define('FOUNDATION_NAME', 'Full Charity Name');
define('FOUNDATION_DESC', 'Short mission description shown on the home screen.');
define('FOUNDATION_LOGO', '');               // logo URL or leave empty

define('DEFAULT_LANG', 'pl');

define('ADSENSE_CLIENT', 'ca-pub-XXXXXXXXXXXXXXXX');   // from charity
define('ADSENSE_SLOT',   '1234567890');                // from AdSense slot
```

---

## Step 5 — Configure the subdomain (virtual host)

Add a virtual host in DirectAdmin or server config pointing:

- **Subdomain:** `play.charity.org`
- **Document root:** path to the instance directory (`public_html/charity-abc/`)

After DNS propagation (up to 24h) the subdomain will be live.

---

## Step 6 — Activate AdSense

Once the charity's AdSense account is approved by Google:

1. Open `config.php` in the instance directory
2. Fill in the two AdSense constants (already present from Step 4):
   ```php
   define('ADSENSE_CLIENT', 'ca-pub-XXXXXXXXXXXXXXXX');  // publisher ID from AdSense
   define('ADSENSE_SLOT',   '1234567890');               // ad unit slot ID from AdSense
   ```
3. Save the file — ads are injected automatically by PHP, no template changes needed.

The ad unit appears at the `<!-- ADSENSE_PLACEHOLDER -->` location in each page.

---

## Step 7 — Final verification

Run through the full flow on the new subdomain:

- [ ] Home screen loads with charity name and description
- [ ] Global counter visible (0.0000 PLN at launch)
- [ ] "Play and help" opens the game screen
- [ ] Candy Crush board renders correctly
- [ ] Session counter increments every second
- [ ] Ending the session shows the summary screen with earned amount
- [ ] Global counter on the home screen increased after the session
- [ ] PL/EN language switcher works on both screens
- [ ] Page works correctly on mobile (360px viewport)

---

## Onboarding checklist

```
[ ] Database created and schema imported
[ ] Instance directory with project files in place
[ ] config.php filled with charity data and AdSense IDs
[ ] Virtual host / subdomain configured
[ ] DNS propagated and subdomain resolves correctly
[ ] Final verification passed
[ ] AdSense active (or scheduled once account is approved)
```
