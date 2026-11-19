# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hessaminanloo/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hessaminanloo/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01). Open `app/index.html` in a desktop browser — no server, no network, no build step — and it works.

## What it does

- **The full official list.** All 55 trophies with their official names, descriptions and grades as PlayStation publishes them: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden.
- **A guide for every trophy**, written for this app, each one naming its sources beside it (the official list on Exophase, PSNProfiles' targets, and the established guide sites). Five trophies whose trigger no source has confirmed yet say exactly that instead of inventing steps.
- **A tracker.** Tick trophies off as you earn them; progress saves in the browser (localStorage) and can be exported to a JSON file and imported back on any machine.
- **Filters and search.** By kind — story, missable, collectibles, activities, online — or by free text across names, descriptions and guides.
- **Spoiler mode.** Hidden and story trophies stay masked until you earn them or choose to reveal one.
- **A roadmap to the platinum** in three steps, built from the official descriptions, with the list's one missable trophy — Positive Mental Attitude — flagged and explained, and a counts table that agrees with the data.
- **A demo mode.** Add `?demo=1` to the address to see a sample checklist. It lives in memory only and never overwrites a saved checklist.

## Layout

- `app/` — the guide itself: `index.html`, `style.css`, ES modules under `js/` (data loading, the progress store, filters, rendering, boot), and the data under `data/` (`trophies.json`, `roadmap.json`).
- `screenshots/` — four renders of the app at 1280×800; `shots.json` says what each one shows.
- `main.ts` — the hand-in program (Node 22, standard library only): copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored library in `vendor/`.
- `serve.ts` — a small local server for trying the guide (`node serve.ts`, then open the address it prints).

## License

MIT — see `LICENSE`.
