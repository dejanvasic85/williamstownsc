# Results Crawling & Score Data

**Created:** 2026-03-04
**Status:** Completed 2026-03-04

## Purpose

Dribl's fixtures page only shows upcoming matches. Past matches with scores live on a separate `/results/` route. Re-crawling mid-season loses past fixture data since sync does a full overwrite. Need to crawl results to preserve past matches and capture scores (full-time + half-time).

## Requirements

- Crawl both `/fixtures/` (upcoming) and `/results/` (past + scores) in a single crawl run
- Store results chunks separately in `data/external/results/{team}/`
- Sync merges both sources; results win on dedup (they have scores)
- Add score fields to canonical schema: homeScore, awayScore, homeScoreHalf, awayScoreHalf, status
- No UI changes in this plan — score display is a follow-up

## Data Flow

```
fv.dribl.com/fixtures/  -->  data/external/fixtures/{team}/chunk-N.json
fv.dribl.com/results/   -->  data/external/results/{team}/chunk-N.json
                                         |
                              syncFixtures reads BOTH dirs
                              results first (win dedup)
                                         |
                              data/matches/{team}.json (full season + scores)
```

## Todo

- [x] Add score/status fields to `fixtureSchema` and `EnrichedFixture` in `src/types/matches.ts`
- [x] Map score fields in `transformExternalFixture` in `src/lib/matches/fixtureTransformService.ts`
- [x] Extract `crawlPage()` function in `bin/commands/crawlFixtures.ts`, call for both `/fixtures/` and `/results/`
- [x] Update `bin/commands/syncFixtures.ts` to read both dirs, results-first merge
- [x] Pass through scores in `enrichFixtures` in `src/lib/matches/matchService.ts`
- [x] Increase CI timeout from 5 to 15 min in `.github/workflows/crawl.yml`
- [x] Run type:check, lint, format, build — all passed

## Files

- `src/types/matches.ts` — schema + type changes
- `src/lib/matches/fixtureTransformService.ts` — map score fields (`?? undefined` for nullable)
- `bin/commands/crawlFixtures.ts` — extract `crawlPage`, crawl both routes, reset responses between
- `bin/commands/syncFixtures.ts` — parameterise `readExternalFixtureFiles`, read both dirs, results-first
- `src/lib/matches/matchService.ts` — pass through scores in enrichment
- `.github/workflows/crawl.yml` — timeout increase

## Key Design Decisions

- **Results win dedup**: existing `deduplicateFixtures` keeps first-seen. Pass `[...resultResponses, ...fixtureResponses]` so results entries are encountered first
- **Same browser session**: crawl both pages sequentially, reset `responses.length = 0` between
- **Results dir optional**: sync gracefully skips if `data/external/results/{team}/` doesn't exist yet
- **Raw API already has scores**: `externalFixtureAttributesSchema` already validates `home_score`, `away_score` etc. — just not mapped through transform

## Unresolved Questions

- Results page filter UI assumed identical to fixtures page — may need adjustment if labels differ
