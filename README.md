[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/b19bay/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/b19bay/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Offline](https://img.shields.io/badge/offline-static%20app-green)](app/index.html)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

An offline web app that guides and tracks all **55 PlayStation 5 trophies of Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden). Static files under `app/` — open `app/index.html` in desktop Chrome with the network off and it works.

## What it does

- **Checklist** of every trophy with its official name, description and grade, a tick box, and progress saved in the browser (localStorage). Export progress to a file, import it back.
- **Filters** by kind (story, missable, collectibles, activities, online — there are no online trophies), by grade, and by search; plus an earned-only toggle.
- **Spoiler setting** that hides story trophy names, descriptions and guides until they are earned.
- **Roadmap to the platinum** in 7 stages, built from the official descriptions (story chapters and missions first, stranger strands as they appear, then activities, collectibles, robberies and money, then 100% cleanup).
- **Missables page**: 8 flagged trophies, with the save warning (no mission replay is reported — keep a manual save at the start of every chapter and before the final mission).
- **A guide for every trophy in our own words**, each naming its sources beside it. Where no method is confirmed yet (The Truth Is Out There), the guide says so instead of inventing one.

## Sources

- Official names, descriptions, grades: Exophase — GTA VI trophy list (https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/), cross-checked against PSNProfiles — GTA VI trophies (https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). The two agree on every name, description and grade.
- 397 stunts, 18 card sets (15 for 100%), progress tracking: Push Square — GTA 6 Trophy Guide & Roadmap (https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap).
- No mission replay, manual save per chapter, Chapter 1 meditation spot: Output Lag — GTA 6 Trophy List (https://outputlag.com/guides/gta-6-trophy-list/).
- Positive Mental Attitude as the only possibly-missable trophy (per PowerPyx / GTABase): EGamers — GTA 6 Trophy List (https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/).
- Missables cannot be settled yet, a day after launch: PlanetGTA6 — GTA 6 Trophies (https://www.planetgta6.com/en/gta-6-trophies/).

Source URLs live in this README only. The app itself carries no URLs and makes no network requests: every guide cites its sources by name, and a reader follows a source from here, not from inside the app.

## Notes on the data

- Hidden flags (28): the story trophies (17) plus the vague-description trophies are marked hidden, per the published grade table (27 visible / 28 hidden). The spoiler setting hides story trophies specifically, which is what the rules require.
- The game launched 19 November 2026; launch-era guides are thin, so specifics are hedged and cited. Details will be corrected against real guides as they appear, with the source named each time.
- No Rockstar logo, artwork or game screenshots anywhere in the app. The look is our own.

## Screenshots

Rendered in-session by the app's own code: `app/src/shots.js` draws the app's views (checklist with a guide open, roadmap, tracker with spoilers on, a cited guide) from the same `app/data/trophies.json` and the same design tokens as the DOM app. The local Chromium could not start in this session (Hatch WebGL domain policy blocks its startup), so a small rasterizer (`rasterize.py`, Pillow + DejaVu Sans, the family the renderer measures against) turns the renderer's draw lists into JPEG. Regenerate with:

```sh
node make-shots.mjs
python3 rasterize.py /tmp/gta6-shots screenshots
```

## Build / submit

```sh
node serve.ts            # serves app/ on http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # validates, then writes out/
```

`main.ts` runs an authored pre-submit validation first (55 names, non-blank cited guides, grade split, no network references in `app/`, screenshot count/size) and fails loudly before writing any output. `vendor/makefun-frontend.ts` is the kit copy, unchanged.

## License

MIT — see LICENSE.
