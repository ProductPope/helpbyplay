# Onboarding a new charity — platform owner guide

Steps the platform owner takes when adding a new charity to Help By Play.

For the generic server installation steps (database, config.php, upload, verification), follow [INSTALL.md](INSTALL.md) — this document covers only what is specific to onboarding a charity onto the central platform.

---

## Prerequisites

- The charity has completed both their steps:
  - DNS record added (`play.charity.org` → platform server, or a `charity.helpbyplay.com` subdomain)
  - Google AdSense account created for the game domain
- Access to the Cyberfolks server (FTP + DirectAdmin panel)
- Charity's AdSense publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`) and ad slot ID — may arrive later, after AdSense approval

---

## Step 1 — Domain in DirectAdmin

Add the charity's domain as an addon domain in DirectAdmin, with its document root pointing at the new instance directory (e.g. `domains/play.charity.org/public_html/`).

Each charity gets its own directory and its own database — instances are fully independent.

---

## Step 2 — Install the instance

Follow [INSTALL.md](INSTALL.md) steps 2–7 inside the instance directory:

1. Create the database in DirectAdmin → MySQL Management, import `db/init.sql` via phpMyAdmin
2. Create `config.php` with this charity's data (name, description, logo, language)
3. Set both constants in `shared/display_offset.php` to `0` (the offset is for core.helpbyplay.com only)
4. Replace `ads.txt` with the charity's own publisher line (or remove until AdSense is approved)
5. Upload files via FTP, run the verification checklist

---

## Step 3 — Activate AdSense

Once Google approves the charity's AdSense account:

1. Open `config.php` in the instance directory
2. Set the ad constants:
   ```php
   define('AD_PROVIDER', 'adsense');
   define('ADSENSE_CLIENT', 'ca-pub-XXXXXXXXXXXXXXXX');  // publisher ID from charity
   define('ADSENSE_SLOT',   '1234567890');               // ad unit slot ID
   ```
3. Make sure `ads.txt` at the domain root contains the charity's publisher line
4. Save — ads render automatically via `shared/ads.php`, no template changes needed

Ads only display after the player accepts cookie consent; until then the placeholder is shown.

---

## Onboarding checklist

```
[ ] DNS record added by charity and propagated
[ ] Addon domain configured in DirectAdmin
[ ] Database created and schema imported
[ ] config.php filled with charity data
[ ] display_offset.php constants set to 0
[ ] ads.txt replaced with charity's publisher line
[ ] Files uploaded, verification checklist from INSTALL.md passed
[ ] AdSense activated (or scheduled once account is approved)
```
