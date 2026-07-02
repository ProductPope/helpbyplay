# Help By Play

**Your charity earns while players have fun — no donation campaigns required.**

Help By Play is a gaming platform for charities. Players play free mini-games on the charity's subdomain, AdSense ads are shown, and the revenue goes to the charity.

---

## How it works

1. The charity joins the platform (see: How to join)
2. A player visits `play.yourcharity.org`, clicks "Play and help"
3. They pick one of ten mini-games and play — free, no registration required
4. AdSense ads are displayed during gameplay
5. A public counter shows the total amount raised since the instance launched

**The charity does nothing after joining.** The platform runs autonomously.

---

## What the charity gets

- Passive ad revenue without traditional fundraising campaigns
- A branded subdomain with a live counter — a powerful communication tool for volunteers and supporters
- No technical overhead — hosting and maintenance handled by the platform
- Zero barrier to entry for players — no accounts, no sign-ups

---

## How to join

The charity completes **two steps**:

**Step 1 — DNS record**
Add a DNS subdomain record (e.g. `play.yourcharity.org`) pointing to the platform server.
The exact server IP and record type will be provided by the platform owner after onboarding.

**Step 2 — Google AdSense account**
Create a Google AdSense account for the subdomain and share the publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`) with the platform owner.
AdSense verification can take from a few days to a few weeks.

Once both steps are complete, the platform owner configures the instance and the page goes live.

---

## What the player sees

- **Home screen** — charity name and description, global earnings counter, tiles with ten mini-games (match-3, 2048, snake, memory, minesweeper, platformer, jumper, invaders, bricks, runner)
- **Game screen** — the chosen game with a live session earnings counter
- **Stats page** — sessions and amounts raised today, this week, and all-time

Interface available in Polish and English (player toggles with a button).
Designed mobile-first — works on any screen size.

---

## The story

The idea is over 11 years old. Online games, ad revenue, charities — the model made sense. Early prototypes with developer friends showed promise, but advertisers had no interest in a project with zero traffic. A vicious circle. We spent family savings, hired a developer, paid out over 3,500 PLN across a dozen organisations — every single złoty. But without an advertiser the money kept running out. The project died.

April 2026: AI tools changed what one person can build. And one more thing changed: Google AdSense now pays charities directly — no intermediary needed. Help By Play is back, this time as [open source](https://github.com/ProductPope/helpbyplay).

---

## Contributing

The platform is open for contributions in four areas:

**New games** — Each game lives in `games/<name>/` with `game.js`, `game.css`, and `index.php`. A new game must define `GAME_CONFIG` and `initGame()` — the shared `session.js` handles the session lifecycle. See any existing game for the pattern. Mobile-first (360px base) is a hard requirement.

**Translation review (PL/EN)** — All UI strings are in `lang.php`. Both languages need a native-eye pass for tone, consistency, and anything that reads like machine translation.

**Bounty hunting** — Edge cases, device-specific bugs, broken flows. Mobile Safari and older Android WebView are the priority targets.

**QA testing** — Full session flow on real devices: load → play → session end → summary. Verify earnings counter, inactivity timeout, and ad placeholder layout across browsers.

### Ground rules

- **Small, focused PRs.** One concern per PR. Don't bundle a new game with a shared layout change.
- **Architecture changes require an issue first.** If you're touching `shared/`, `session.js`, `counter.js`, or `layout.php`, open an issue and describe the why before writing code. These files affect every game on every instance.
- **No external libraries.** No build tools. Vanilla JS + plain CSS only — the platform runs on shared hosting.

Stack: PHP 8.1 · Vanilla JS · Plain CSS · MariaDB 10.4. No frameworks, intentionally.

---

## Contact

Want to join the platform? [Open an issue](https://github.com/ProductPope/helpbyplay/issues) or visit [helpbyplay.com](https://helpbyplay.com).

Want to self-host your own instance? Follow the step-by-step guide in [INSTALL.md](INSTALL.md).

---

*Help By Play — every second of play matters.*

Code license: [GPL v3](LICENSE)
