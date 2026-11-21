[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/b19bay/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/b19bay/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Offline](https://img.shields.io/badge/offline-static%20app-green)](app/index.html)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

Leonida Ledger is a companion for chasing the platinum in Grand Theft Auto VI on PlayStation 5. Everything it needs sits in static files inside `app/`, so there is nothing to install and nothing to fetch: point desktop Chrome at `app/index.html`, even with the connection switched off, and the whole thing runs locally. Between its guide pages and its tracker it covers the complete set of 55 trophies: a single platinum, 2 gold, 6 silver and 46 bronze, with 28 of them flagged as hidden.

## What it does

- The checklist lays out all 55 trophies together with the official wording for each name and description and the grade attached to it. Ticking one off records the state in localStorage, so progress survives closing the tab, and the same progress can be saved out to a file through export or brought back again through import.
- Narrowing the list down is handled by a set of filters that can be combined: category filters for story, missable, collectibles, activities and online, a filter for grade, a free-text search, and a switch that leaves only the trophies already earned on screen.
- Anyone who wants to stay unspoiled can turn on the spoiler setting. While it is active, story trophies stay concealed and only become visible once they have actually been earned.
- Planning the run to platinum is the job of the roadmap, which breaks the effort into 7 stages so a player can see a sensible order to work through rather than facing all 55 at once.
- Missable content gets a dedicated page. It pulls together the 8 trophies flagged as missable and stresses a habit worth adopting early: keep manual saves, because there is no mission replay to fall back on if something gets passed by.
- Each trophy also carries its own short guide, written here rather than lifted from elsewhere, and every one of those entries shows which source it leans on right alongside the text.

## Sources

The trophy data and the advice behind the guides were drawn from the following publications, and each guide entry in the app names the one it relies on:

- Exophase, for the published trophy list: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles, for its trophy listing and community context: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- Push Square, for its trophy guide and roadmap coverage: https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap
- Output Lag, for its trophy list article: https://outputlag.com/guides/gta-6-trophy-list/
- EGamers, for its rundown of all 55 trophies and achievements: https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/
- PlanetGTA6, for its trophies page: https://www.planetgta6.com/en/gta-6-trophies/

## Notes on the data

A few caveats are worth stating plainly. Of the 55 trophies, 28 carry a hidden flag, and that split is reflected in how the tracker presents them. The game itself only launched on 19 November 2026, which means the guides circulating in this release period are still early and sparse in places. Where a detail has not yet been firmly established, the wording in this project is deliberately cautious and points back to its citation instead of presenting a guess as settled fact. Finally, nothing belonging to Rockstar appears here: there is no logo, no artwork and no screenshot taken from the game anywhere in the app.

## Screenshots

The pictures under `screenshots/` are not captures lifted from the game. They are produced by this project's own rendering code: `app/src/shots.js` draws the app's views, and `rasterize.py` turns that output into image files. In other words, what the screenshots show is the interface of the app itself, rendered by the same codebase a visitor would run in the browser.

## Build / submit

For a local preview, serve the app with:

```sh
node serve.ts
```

To produce the submission output, run:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Before anything is written out, `main.ts` performs a round of pre-submit validation checks. The file `vendor/makefun-frontend.ts` is simply the kit as it was supplied, kept as an unmodified copy.

## License

MIT — see LICENSE.
