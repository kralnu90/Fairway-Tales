# Fairway Tales · Handover notes

*Kris uploads this at the start of a new session. Read it first, then ask for the repo or index.html if you need the code. Update this file at the end of each session and send it back.*

Last updated: 28 October 2026 · game version **0.15.2**

---

## The project

- **Fairway Tales:** a top-down golf RPG for phones, designed by Kris (kralnu90) and built with Claude.
- **Code:** a single HTML file with canvas and plain JS, no build step and no libraries.
- **Live game:** https://kralnu90.github.io/Fairway-Tales/
- **Repo:** github.com/kralnu90/Fairway-Tales. It holds `index.html`, `README.md`, `sw.js`, `manifest.webmanifest` and `icons/`.
- **Claude preview artifact:** https://claude.ai/artifact/2iNHmP6aADJCUizUAAueyG. Publish to this URL to update it.
- **Other games:** Solaris Gambit (kralnu90.github.io/Solaris-Gambit/). The studio site is kralnu90.github.io ("Kralnu Games"); its videos use `?v=2` cache-busting.
- **Ko-fi:** ko-fi.com/kralnu90. The `KOFI` const in the game holds this link, and the menu has a ☕ button.

## Kris's house rules

- **Costs:** give a heads-up before anything that would cost money (paid APIs, hosting, assets).
- **Delivery:** send unzipped **index.html** and **README.md**, because he uploads to GitHub from his phone. He sometimes edits the README on GitHub, so ask before overwriting if he says he has.
- **Credit line:** "© 2026 kralnu90. All rights reserved."
- **README:** never mention "Formerly Stroke of Luck".
- **AI:** be open that it's AI-assisted ("designed by Kris, built with Claude"). r/golf bans AI content.
- **Usage:** he cares about it, so keep sessions focused and avoid re-reading the whole 370 KB file.

## How to work on it

1. **Get the code:** pull `index.html` from the repo, or ask Kris to attach it.
2. **Edit:** use Python string replacements that assert each anchor matches once, rather than reading the whole file. Use `grep -n` to find anchors. Section headers look like `/* ---------- Name ---------- */`.
3. **Syntax check:** extract the `<script>` block and run `node --check`.
4. **Test:**
   - Run headless Playwright on a debug copy.
   - Inject `window.__e=x=>eval(x);` before `applySettings();startGame({mode:'solo'});` to reach the game's internals.
   - Simulate shots with `strike({p,path,pause,speed,follow,drift,wob})`.
   - Putts go through `startPutt({yd,tilt})`, not `strike`.
5. **Release:**
   - Bump `GAME_VERSION`.
   - Add a changelog entry at the top of the README's `## Changelog` in the same style.
   - Update "What's in it" if features changed.
   - Publish the preview artifact, then send index.html and README.md.
   - The preview artifact is index.html with a different wrapper: drop everything before the Google Fonts `<link>` and put `<title>Fairway Tales</title>` and `<meta name="claude:viewport-fit-sides" content="cover">` there instead. Remove `</head><body>` and the service-worker `<script>` at the end, along with `</body></html>`.
6. **Service worker:** `sw.js` fetches the game page from the network first, so updates show without changes. Only bump its `VERSION` if icons or the manifest change.

## How the game is built (key systems)

- **Save:**
  - Stored in `localStorage` under `fsl-save`.
  - It holds coins, kits, owned clubs (lvl/xp/tuned), bag, shards, pity, rounds, fits, fitOn, story flags, chal, daily, st (career stats), ach and title.
  - Use `persist()` to save; it also runs `checkAch()`.
  - `ensureSave()` patches older saves.
- **Clubs (`DEFS`):**
  - 49 clubs with rarities common, rare, epic and legendary.
  - Sources: shop, rival shards (5 forge an epic), loot (rares only), daily, legend.
  - Clubs level up to 10, with caps at Lv 4 and Lv 7 that need tuning kits plus coins.
- **Fittings:**
  - Head, shaft and grip parts in 5 tiers, each trading one stat for another.
  - Drop rate is about 1 in 12. Trading in 3 gives 1 new part of the average tier or better.
  - Each part fits one club. The bench was redesigned in 0.12.1.
- **Swing difficulty (`DIFF`):** follows handicap, from Relaxed to Pro. Higher levels pay more (`rewardMul`). Players can lock their level in Settings.
- **Courses:** Ashby Green (parkland), Gullhaven Links (gusty wind, gorse, pot bunkers), Sun Mesa (desert, waste areas, cacti), Frostpeak (ice, snow, quick greens).
- **Story:**
  - A walkable overworld, 4 chapters and 16 rivals, with flags in `SF()`.
  - The finals are 9-hole matches with 1 Mulligan.
  - Chapter 5 is not built.
- **Modes:**
  - Solo round, Pass & play (2–4 players, Clubhouse set, no rewards), Play a hole, Course creator (share codes).
  - Practice ground: driving range, chipping green and putting green with 4 surfaces.
- **Challenges:**
  - Seeded so every player gets the same pins and wind.
  - FTC1 (challenge) and FTR1 (result) codes are hash-checked, and FTR1 carries an optional title.
  - Leaderboard is in `chview`.
- **Daily challenge (0.13):**
  - Seeded by date, with 4 rotating formats: closest to the pin, long drive, up and in, putting.
  - Medals: gold 220 coins plus a 35% fitting chance, silver 120, bronze 60, 25 for finishing without a medal.
  - The first scored go each day counts. Restart is blocked during a scored go.
  - Streak: every 7 finishes gives Hawkeye, then 300 coins. The streak pauses rather than resets.
  - Known gap: quitting mid-run and starting again from the menu gives a fresh go.
- **Trophies (0.13):**
  - 42 achievements in `ACH`, grouped Story, Skill, Collection, Swing, Social, Practice and Daily.
  - Rewards are coins, kits or fittings. Some unlock titles.
  - Past progress was awarded the first time the update loaded.
- **Legendary clubs (0.13):** 7 clubs earned by trials in solo or story play (`realPlay()`). Trials and effects:
  - **Sunforged** driver: carry 300 yards. No overswing penalty.
  - **Tempest** 3 wood: par or better at Gullhaven in 18 mph wind. Wind has no effect.
  - **Starfall** 5 iron: an albatross, or an ace on a par 4. Rough and waste play like fairway.
  - **Heartwood** 7 iron: all 9 greens in regulation. Swipes within 2° of straight fly dead straight.
  - **Moonshadow** 9 iron: 3 hole-outs from off the green. No distance lost from sand or snow.
  - **Phoenix** wedge: win a 9-hole final under par with the Mulligan unused. Double spin-back.
  - **Oracle** putter: hole 3 putts from 30 ft or more. Unlimited green reads and a 1.2× cup.
- **Rollout (0.14):**
  - `rollOut()` is the single source of how far the ball runs or spins back. `land()` and `predictShot()` both use it.
  - Green `land` is 0.85, up from 0.5. Partial swings run out more (`pw` is stored on the flight), and there's a minimum of 0.8 yd on greens.
  - The ball keeps its pace through its landing hops. Spin-back waits for the hops to finish (`bounce.hold`).
- **Guide line (0.14):**
  - The 📏 button next to the club shows a green line and the carry while you swipe. It uses `cleanCarry()` and `guideShot()`, with wind included.
  - Charges are stored in `save.guides`. Everyone starts with 5, and the pro shop sells 10 for 150 coins (`GUIDE_PRICE`, `GUIDE_PACK`).
  - Each shot uses 1 charge, and a Mulligan refunds it. It's free in practice and blocked in challenges (`CH`), the daily and pass & play. The button hides at 0.
- **3-click swing (0.15):**
  - Optional, set in Settings → Swing control (`SET.ctl` = 'pad' or '3'). `CTL` locks it in `startGame()`, so it can't change mid-round. `clickOn()` checks it.
  - Section `3-click swing` (after Swing pad): `meterTap()`, `lockPower()`, `tickMeter()` (called from `frame()`), `meterHit()`, `drawMeter()`. State lives in `mtr` (`ph` up/down, `v`, `p`, `half`, `putt`).
  - Tap 1 starts, tap 2 sets power (up to 115%, auto-locks at the top), tap 3 on the white line. The meter auto-misses at `MLOW` (-0.25). A ✕ Cancel button (`#mCancel`) shows until power is set.
  - Speed `MSPD` is [.8,.9,1,1.1,1.2] (0.15.2). Kris's spec for Hard: 1 second up to 100%, 1 second back to the line, so the return runs at the same speed as the rise. Putter meter is 0.85×. Sweet half-width `MWIN` scales by swing level. Control widens it 1% per point. Strike-ball shaping (`SP.x`) shrinks it by up to 45%, and the strike ball is frozen while the meter runs.
  - Error outside the sweet spot × 70 = swipe path degrees (cap 14). Early pulls, late pushes (flipped for lefties). Fixed tempo values go into `strike()`, so Sunforged, Heartwood and the guide line all work unchanged.
  - Putts use the same 3 taps with a slower meter and 1.6× sweet spot, into `startPutt()`.
- **Two dailies (0.15):** `dailyToday(c)` seeds with `ftd3` for 3-click. `dHist(c)` gives `save.daily.hist` (pad) or `hist3` (3-click). The streak (`days`) and Hawkeye only tick if neither track has today yet.
- **Challenge results (0.15):** FTR1 carries `m:1` for 3-click, included in the hash. Older codes still validate. Leaderboard shows 🎯 3-click.
- **Shot summary (0.13.1):** tap it or its × to close. It clears itself after 10 seconds.
- **Reviews:** the "Leave a review" button posts to Kris's Google Form.

## Agreed but not built yet (don't re-decide)

1. **Club rework:**
   - Every club gets a neutral baseline of 10 for every stat, keeping its perks.
   - Stats come from fittings, with all 3 slots kept.
   - Fitted parts get a rarity multiplier of about ×1.0, 1.15, 1.3 and 1.5 by tier. 5 tiers exist, so confirm the top value.
   - Club levels add 5% per level.
2. **Ball slot:** one permanent ball choice (no breaking or losing it) from Distance, Tour (spin), Soft and Heavy (forgiveness/weight).
3. **Live multiplayer rooms:**
   - Players join with a share code.
   - It would use Firebase on the free Spark plan. Give Kris a cost heads-up before setting it up.
4. **Skyreach:** story chapter 5.

## Other notes

- **itch.io:** decided against for now. Promotion is through Ko-fi, Reddit (r/playmygame and AI-friendly communities) and YouTube or Facebook shorts.
- **Old files:** Kris's phone sometimes renames uploads to "index (1).html", so he should rename them on GitHub.

## Session log

- **27 Oct 2026:**
  - Shipped 0.13: daily challenge, trophies, legendary clubs.
  - Shipped 0.13.1: closable shot summary.
  - Created these notes.
- **28 Oct 2026:**
  - Shipped 0.14: approach shots release on the green, plus the guide line consumable.
  - Shipped 0.15: optional 3-click swing, shaping shrinks the sweet spot, a separate 3-click daily with a shared streak, and 🎯 on challenge results.
  - Shipped 0.15.1 and 0.15.2: retimed the 3-click meter (Hard is 1 s up and 1 s back).
