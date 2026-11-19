[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hessaminanloo/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hessaminanloo/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Built for the [make.fun bounty gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Every trophy, exactly as PlayStation publishes it** — official name, description and grade for all 55 (1 platinum, 2 gold, 6 silver, 46 bronze), with the 28 hidden trophies flagged.
- **A guide for each trophy, in our own words, with its sources beside it** — mostly PowerPyx's GTA 6 Trophy Guide & Roadmap, cross-checked with the official list on Exophase and PSNProfiles. Five trophies had no published method on launch day (19 Nov 2026); their guides say so honestly instead of inventing a location.
- **A checklist tracker** — tick trophies off and your progress is saved in the browser (localStorage), with export to a JSON file and import back. Demo mode (`?demo=1`) only seeds progress when nothing is saved, and never writes it — a demo link can never wipe a real checklist.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, by earned/remaining, plus full-text search.
- **A spoiler setting** — hides the names and descriptions of hidden trophies until you earn them.
- **A roadmap to the platinum** — three steps (story, 100% checklist, cleanup), the story chapters and their trophies, and every count that matters (250 of 397 stunts, 42 shooting-range golds, 200 of 277 vehicles, 15 target decks, and more).
- **A missables page** — the one potentially missable trophy (Positive Mental Attitude, Chapter 1) in full, and why nothing else can be missed.
- **Fully offline** — static files under `app/`, no build step, no network request at run time. No Rockstar logo or official artwork anywhere.
- **Verified in a headless browser** — 22 checks passed on 19 Nov 2026: 55 cards render, 0 console errors, 0 external requests, checklist persistence, export/import round-trip, filters, spoiler masking (25 of 28 hidden trophies masked with the 13-earned demo set) and the demo-mode fix.

## How to run it offline

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Any static file server works — serve `app/` as the root and open `index.html`.

Useful URL parameters (also used for the screenshots in `shots.json`):

- `?demo=1` — seeds 13 earned trophies so the tracker shows progress (memory-only, and only when nothing is saved)
- `?open=<trophy-id>` — opens that trophy's guide in the detail pane
- `?spoiler=1` — turns the spoiler setting on
- `?view=roadmap` or `?view=missables` — opens that tab

## Layout

- `app/index.html` — the shell: masthead with progress, tabs, toolbar, three views
- `app/style.css` — the whole look (warm paper, one sunset accent, system fonts)
- `app/js/main.js` — boot, state, toolbar wiring and hash routing
- `app/js/store.js` — localStorage progress, export and import
- `app/js/filters.js` — kind/grade/search filtering and the spoiler rule
- `app/js/checklist.js` — the trophy list, per-grade progress and next-up
- `app/js/detail.js` — the guide pane with sources
- `app/js/roadmap.js` — the platinum roadmap view
- `app/js/missables.js` — the missables view
- `app/data/trophies.json` — the 55 trophies with guides and sources
- `app/data/roadmap.json` — the roadmap steps, chapters and counts
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output and writes `dossier.json`
- `screenshots/` — renders of the app taken in a headless browser

## How the entry is handed in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`. Grand Theft Auto and GTA are trademarks of Take-Two Interactive. This is an unofficial fan-made guide, not affiliated with Rockstar Games.
