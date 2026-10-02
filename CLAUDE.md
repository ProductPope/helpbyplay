# Help By Play — Project Context
# Place at: [project-root]/CLAUDE.md
---

## PROJECT OVERVIEW
**Name:** Help By Play
**Type:** Full-stack (PHP + Vanilla JS)
**Purpose:** Gaming platform for charities — players play mini-games, AdSense ad revenue goes to the selected charity
**Status:** MVP — 10 games live on core.helpbyplay.com
**Platform URL:** `core.helpbyplay.com` — main platform install on Cyberfolks
**Main site:** `helpbyplay.com` — separate marketing website, independent from this project

---

## TECH STACK
**Frontend:** Vanilla JS (no frameworks)
**Styling:** Plain CSS
**Backend:** PHP 8.1
**Database:** MySQL MariaDB 10.4+ (Cyberfolks shared hosting)
**Auth:** None — fully anonymous play, no login required
**Deployment:** Cyberfolks shared hosting, FTP upload, DirectAdmin panel
**Key dependencies:**
- No external JS libraries — intentional, for maximum simplicity and shared-hosting compatibility

---

## PROJECT STRUCTURE

```
public_html/
├── index.php             # Home screen: foundation info, stats bar, game tiles
├── statystyki.php        # Public stats page (today / week / all time, optional v0.9 history)
├── config.php            # PRIVATE — never committed to git (.gitignore)
├── config.example.php    # Template for config.php (DB, foundation, ads, display offsets)
├── lang.php              # All PL/EN translations; t(), t_js(), get_lang()
├── ads.txt               # Per-instance AdSense publisher line (not overwritten on upgrade)
├── .htaccess             # Security headers, access rules, static asset caching
├── LICENSE / README.md / INSTALL.md / ONBOARDING.md
├── api/
│   ├── session_start.php # Creates a session (+ secret token), per-IP rate limit, stale sweep
│   ├── session_end.php   # Heartbeat / end / beacon — requires token, updates global total
│   └── stats.php         # Returns global counter as JSON
├── db/
│   ├── init.sql          # Schema for fresh installs
│   └── migrate_NNN_*.sql # Upgrades for existing installs, run in order
├── shared/               # Include-only PHP (direct HTTP access denied by shared/.htaccess)
│   ├── db.php            # hbp_db(), hbp_finalize_session(), stale sweep, limits/constants
│   ├── layout.php        # render_header/footer, render_session_screens, render_below_game, HBP_GAMES
│   ├── ads.php           # render_ad_slot() — provider switch, contains ADSENSE_PLACEHOLDER
│   ├── session.php       # Loads $totalSessions / $totalPln for the header
│   ├── display_offset.php# 0/false fallbacks for DISPLAY_* / SHOW_V09_HISTORY config
│   └── assets/           # shared.css, counter.js, session.js, cookie-consent.js, lang.js
├── assets/style.css      # Home page styles
└── games/<key>/          # One directory per game: index.php, game.js, game.css
```

**Entry point:** `index.php`
**Game list:** `HBP_GAMES` in `shared/layout.php` — the single source for home tiles and the "other games" carousel. A new game needs a `games/<key>/` directory, lang keys `game_<key>_name/_desc/_about/_tutorial`, and a case in `game_thumbnail_svg()`.
**Game page contract:** `game.js` defines `initGame()`; script order is `counter.js → game.js → session.js`. Game strings needed in JS go into `lang.php` as `js_*` keys and are read with `hbpT('js_...')`.

---

## DESIGN SYSTEM

**General principle:** Simple, clean interface. Priority: trust and readability, not visual effects.

**Color tokens (CSS variables):**
```css
--color-primary: #2E7D32;     /* green — associated with help and nature */
--color-primary-light: #4CAF50;
--color-surface: #FFFFFF;
--color-background: #F5F5F5;
--color-text: #212121;
--color-text-muted: #757575;
--color-border: #E0E0E0;
--color-accent: #FF7043;      /* accent for CTA buttons */
```

**Typography:**
- Font family: system font (system-ui, sans-serif) — no external fonts
- Base size: 16px
- Scale: 12 / 14 / 16 / 20 / 24 / 32px

**Spacing scale:** 8px base (8 / 16 / 24 / 32 / 48px)
**Border radius:** sm: 4px, md: 8px, lg: 16px

**Key reusable components already built:**
- `render_header()` / `render_footer()` — page shell, header stats, footer, cookie banner
- `render_ad_slot()` — the one ad location per page
- `render_session_screens($key)` — summary / error / inactivity screens for game pages
- `render_below_game($key)` — "Finish" button, game info, other-games carousel, charity card
- `.btn-play`, `.btn-secondary`, `.summary-card`, `.stat-card` (shared.css)

---

## BUSINESS CONTEXT

**Target user:** Anonymous player (no registration) — visits the charity's subdomain, plays, helps

**Hosting model (IMPORTANT):**
- Platform hosted centrally at `core.helpbyplay.com` (Cyberfolks, single server)
- `helpbyplay.com` = separate marketing site — NOT part of this project
- A charity does NOT install anything themselves — they join via two steps:
  1. Create a Google AdSense account for their game domain
  2. Add a DNS record pointing to the platform server (details provided by platform owner)
- Platform owner configures each new instance (database, config.php, addon domain in DirectAdmin)
- The charity is a platform partner, not a technical operator

**Charity game URLs — two supported options:**
- **Option A — charity's own domain:** `play.charity.org` → A or CNAME record → `core.helpbyplay.com` server IP → addon domain in DirectAdmin → instance directory
- **Option B — platform subdomain:** `charity.helpbyplay.com` → DNS record on helpbyplay.com → addon domain in DirectAdmin → instance directory
- Both options require only DNS config and an addon domain — PHP code is identical

**Core problem solved:** Charities can generate passive ad revenue through player engagement, without running donation campaigns and without any technical overhead on their side

**Key metrics:**
- Number of play sessions (publicly visible as a counter)
- Total simulated amount raised for the charity (publicly visible)
- Session duration

**Non-goals (MVP):**
- No user registration or accounts
- No ad network other than AdSense / a custom creative (see `AD_PROVIDER`)
- No admin panel
- No multi-charity support per instance
- No payout system

**Terminology to use consistently:**
- "session" → one game run from start to end
- "global counter" → sum of simulated funds raised for the charity since the instance launched
- "simulated amount" → estimated value of ad impressions, NOT real money
- "instance" → one Help By Play configuration for one charity on their subdomain (managed by platform owner)
- "charity" → the charitable organisation that is a platform partner
- "platform owner" → the person/team managing the server and adding new charities to the platform

---

## DEVELOPMENT COMMANDS

```bash
# Local development — all URLs are root-relative (/api/, /games/), so the
# project must be served from the web root, not a subdirectory
cp config.example.php config.php   # fill in local DB credentials
php -S localhost:8000              # or XAMPP with htdocs = project root
# Open: http://localhost:8000  (.htaccess rules need Apache to take effect)

# Repository checks (also run by CI on every push)
php .github/scripts/check.php      # PL/EN key parity, unknown t() keys, Polish text outside lang.php

# Deploy to Cyberfolks
# 1. Upload all files via FTP to public_html (except config.php)
# 2. Upload config.php separately by hand
# 3. Fresh install: import db/init.sql via phpMyAdmin in DirectAdmin panel
#    Upgrade: run new db/migrate_NNN_*.sql files BEFORE uploading PHP (see INSTALL.md)

# Post-deploy verification
# Open the charity's domain → check home screen loads
# Click "Play" → check game launches
# Play for 30 seconds → check session counter increments
# Click "Finish and see summary" → check global counter updated
# Check PL/EN switcher works on both screens
```

**How to verify changes work:**
Open the charity subdomain, run the full flow: home screen → game → summary. Check global counter before and after a session — it should increase by the amount shown in the summary.

---

## CURRENT FOCUS

**Active task / sprint goal:**
Stabilise the multi-game MVP: trustworthy counter (no inflation, no lost mobile sessions), GDPR-compliant ads, clean per-instance configuration, onboarding documentation.

**Known issues / blockers:**
- Charity config values (name, description, logo) must be filled in by platform owner when creating config.php
- Cyberfolks MySQL credentials filled in per-instance in config.php
- AdSense IDs provided by charity after account approval — placeholder until then
- EEA ads require a Google-certified CMP (TCF v2.2); the built-in cookie banner covers consent storage only

**What NOT to touch right now:**
- Do not add user registration
- Do not build an admin panel
- Do not add external JS libraries

---

## ADSENSE PLACEHOLDER

Every page layout contains exactly one ad location, rendered by `render_ad_slot()` in `shared/ads.php`. It always starts with the marker comment `<!-- ADSENSE_PLACEHOLDER -->`.

`AD_PROVIDER` in config.php selects what is rendered:
- `''` — grey placeholder only; the session counter never runs (no real ad, no revenue)
- `'adsense'` — `<ins class="adsbygoogle">` with `ADSENSE_CLIENT` / `ADSENSE_SLOT`; the AdSense script loads only after cookie consent
- `'custom'` — raw HTML from `AD_CUSTOM_HTML_MOBILE` / `_DESKTOP`, shown only after consent

---

## OPEN SOURCE

Licensed under GPL v3. Any charity can fork and self-host their own instance.

Files that MUST be in the repository:
- `config.example.php` (template without real credentials)
- `LICENSE` (GPL v3)
- `README.md` (project and platform model description)
- `ONBOARDING.md` (steps for adding a new charity — for platform owner)

Files that NEVER go to GitHub (covered by .gitignore):
- `config.php` (real database credentials and charity data)

---

## SIMULATED COUNTER LOGIC

Rate: 0.001 PLN per 10 seconds of play (`HBP_PLN_PER_SECOND` in shared/db.php, `PLN_PER_SECOND` in counter.js).
The counter visible to the player increments client-side, only while an ad is visible and the player is active (pauses after 10 s idle, auto-ends after 10 min idle).

Session lifecycle (`shared/assets/session.js` ↔ `api/`):
1. `session_start.php` creates the row and returns `session_id` + secret `token`; it also enforces the per-IP limits and closes stale sessions
2. Every 30 s (tab visible) and on tab hide, a heartbeat saves `duration_sec` and `last_seen_at`
3. The session ends via the "Finish" button (summary screen), inactivity auto-end, or a `pagehide` beacon
4. `session_end.php` caps the duration to real elapsed time and `HBP_MAX_SESSION_SEC`, then `hbp_finalize_session()` sets `ended_at` and adds to `stats` in one transaction (guarded by `ended_at IS NULL`, so it counts once)
5. Sessions with no heartbeat for 15 min are closed by the server sweep using their last saved duration

Metrics: `stats.total_sessions` = unique devices with at least one completed session ("players" in the header). The stats page counts sessions with `duration_sec > 0`.
Public totals add `DISPLAY_SESSIONS_OFFSET` / `DISPLAY_PLN_OFFSET` from config.php (non-zero on core.helpbyplay.com only).

---

## MOBILE-FIRST — PRIMARY RULE

The entire project is designed for 360px viewport first, then scaled up for larger screens.

**Mandatory rules:**
- Base CSS at 360px, breakpoints via `min-width` only (never `max-width`)
- Buttons and touch targets: minimum 48×48px (WCAG 2.5.5)
- Game board: sized by CSS to fit within 360px without horizontal scroll
- Touch events on game board: `touchstart` + `touchend` (tap = select, swipe = swap adjacent)
- `touch-action: none` on board — prevents scroll during gameplay
- `touch-action: manipulation` on buttons — removes 300ms tap delay
- No hover-only interactions — every `:hover` must have a `:focus-visible` equivalent or work via tap
- AdSense ad unit: `max-width: 100%` always, overflow hidden

---

## LANGUAGE RULES

- **Code, comments, repository documentation** (README.md, ONBOARDING.md, LICENSE, PHP/JS/CSS comments, SQL) → English only
- **User interface strings** → via `t('key')` from lang.php only — never hardcode PL or EN strings in PHP/JS
- **Placeholder values** in config.example.php → English
- Polish text in any repository file outside lang.php = error

---

## PROJECT-SPECIFIC RULES

- All user-visible strings exclusively via `t('key')` from lang.php — never hardcode Polish or English in PHP/JS
- `config.php` never goes to the repository — check .gitignore before every commit
- Database writes exclusively through `api/` — never directly from view files
- `stats` table updates always atomic (SELECT + UPDATE in a transaction) — guards against concurrent sessions
- AdSense placeholder always as HTML comment `<!-- ADSENSE_PLACEHOLDER -->` + div — do not remove the comment
- Mobile responsiveness mandatory — game must work on phone, see MOBILE-FIRST section
- No external JS libraries — vanilla only, for maximum shared-hosting compatibility
