# Help By Play — Project Context
# Place at: [project-root]/CLAUDE.md
---

## PROJECT OVERVIEW
**Name:** Help By Play
**Type:** Full-stack (PHP + Vanilla JS)
**Purpose:** Gaming platform for charities — players play mini-games, AdSense ad revenue goes to the selected charity
**Status:** Early prototype (MVP)
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
├── index.php             # Home screen: foundation info + global counter
├── game.php              # Game screen + post-session summary screen
├── config.php            # PRIVATE — never committed to git (.gitignore)
├── config.example.php    # Template for config.php with empty values
├── lang.php              # All PL/EN translations as PHP arrays
├── .gitignore            # Excludes config.php
├── LICENSE               # GPL v3
├── README.md             # Platform description for charities wanting to join
├── ONBOARDING.md         # Steps for adding a new charity — for platform owner
├── api/
│   ├── session_start.php # Records session start to database
│   ├── session_end.php   # Records session end + atomically updates global total
│   └── stats.php         # Returns global counter as JSON
├── db/
│   └── init.sql          # MySQL table creation script
└── assets/
    ├── game.js           # Candy Crush mini-game logic (6x6 board, tiles)
    ├── counter.js        # Simulated earnings counter, increments in real time
    ├── lang.js           # Client-side PL/EN language switcher
    └── style.css         # Global styles, mobile-first responsive
```

**Entry point:** `index.php`
**Main file:** `game.php` (most game and session logic lives here)

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
- [fill in as components are built]

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
- No real AdSense integration (placeholder only)
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
# Local development (optional, requires XAMPP)
# Start XAMPP, put files in htdocs/helpbyplay
# Open: http://localhost/helpbyplay

# Deploy to Cyberfolks
# 1. Upload all files via FTP to public_html (except config.php)
# 2. Upload config.php separately by hand
# 3. Import db/init.sql via phpMyAdmin in DirectAdmin panel

# Post-deploy verification
# Open the charity's domain → check home screen loads
# Click "Play" → check game launches
# Play for 30 seconds → check session counter increments
# End session → check global counter updated
# Check PL/EN switcher works on both screens
```

**How to verify changes work:**
Open the charity subdomain, run the full flow: home screen → game → summary. Check global counter before and after a session — it should increase by the amount shown in the summary.

---

## CURRENT FOCUS

**Active task / sprint goal:**
Build complete MVP: one charity, one Candy Crush mini-game, simulated counter, PL/EN bilingual UI, AdSense placeholder, platform onboarding documentation

**Known issues / blockers:**
- Charity config values (name, description, logo) must be filled in by platform owner when creating config.php
- Cyberfolks MySQL credentials filled in per-instance in config.php
- AdSense IDs provided by charity after account approval — placeholder until then

**What NOT to touch right now:**
- Do not add user registration
- Do not build an admin panel
- Do not integrate real AdSense (placeholder div only)
- Do not add more than one game in this iteration

---

## ADSENSE PLACEHOLDER

Every page layout must contain exactly one location marked:

```html
<!-- ADSENSE_PLACEHOLDER -->
<div id="ad-container" style="width:728px; max-width:100%; height:90px; margin:0 auto; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#999; font-size:12px;">
  Advertisement
</div>
```

Once the charity's AdSense account is approved, replace this div with the AdSense ad unit code. No other code changes are needed.

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

Rate: 0.001 PLN per 10 seconds of play.
The counter visible to the player increments in real time on the client side (JavaScript).
When the session ends, the actual duration is sent to `api/session_end.php`, which:
1. Saves the session to the `sessions` table
2. Atomically updates the total in the `stats` table (within a transaction)
3. Returns the updated global counter

The global counter on the home screen is fetched from `api/stats.php` on each page load.

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
