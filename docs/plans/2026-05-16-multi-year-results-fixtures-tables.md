# Multi-Year Results, Fixtures & Tables

## Purpose

Support browsing multiple seasons of fixtures, results, and tables. As the 2026 season ends (Sept-Oct), that data must be archived so the 2027 crawl doesn't overwrite it. Users should be able to browse any past season via clean URLs. During the off-season (Oct-Feb), the default view shows the most recently completed season with an info banner.

## Requirements

- Multi-year JSON storage per team, keyed by year
- URL path: `/football/teams/[slug]/matches/[season]` and `/table/[season]`
- Base `/matches` and `/table` redirect to latest available season
- Season selector UI on matches and table pages
- Off-season banner: "Viewing {year} season — {next} season begins in March"
- Crawl/sync pipeline writes to year-scoped paths
- Historical data (pre-2026) from a different provider (TBD — separate phase)

## Todo

### Phase 1 — Data Layer

- [ ] Update `bin/commands/syncFixtures.ts`: write to `data/matches/{slug}/{year}.json` (create subdir) instead of `data/matches/{slug}.json`
- [ ] Update `bin/commands/syncTable.ts`: write to `data/table/{slug}/{year}.json` instead of `data/table/{slug}.json`
- [ ] Migrate existing `data/matches/*.json` → `data/matches/{slug}/2026.json`
- [ ] Migrate existing `data/table/*.json` → `data/table/{slug}/2026.json`
- [ ] Update `matchService.ts::loadFixture(slug, year?)` — if no year, read dir and load highest year
- [ ] Add `matchService.ts::getAvailableSeasons(slug): Promise<number[]>` — reads dir entries
- [ ] Update `matchService.ts::getFixturesForTeam(slug, year?)` — pass year through
- [ ] Update `tableService.ts::getTableForTeam(slug, year?)` — if no year, load highest year
- [ ] Add `tableService.ts::getAvailableSeasons(slug): Promise<number[]>` — reads dir entries
- [ ] Update `matchService.ts::getTeamMatches` to always load latest season (next/prev match logic)

### Phase 2 — Routes

- [ ] Create `src/app/(site)/football/teams/[slug]/matches/[season]/page.tsx` (move current matches page here)
- [ ] Replace `src/app/(site)/football/teams/[slug]/matches/page.tsx` with a redirect to latest season
- [ ] Create `src/app/(site)/football/teams/[slug]/table/[season]/page.tsx` (move current table page here)
- [ ] Replace `src/app/(site)/football/teams/[slug]/table/page.tsx` with a redirect to latest season
- [ ] Update `generateStaticParams` on both pages to generate `{ slug, season }` combos from available data
- [ ] Update `TeamDetailNav` links to include the active season segment

### Phase 3 — UI Components

- [ ] Create `SeasonSelector` component: compact tabs or dropdown of available years, active year highlighted
- [ ] Create `OffSeasonBanner` component: visible when `season < currentYear`, e.g. "Viewing 2026 season — 2027 season begins in March"
- [ ] Add both to matches and table pages
- [ ] Off-season logic: `season < new Date().getFullYear()` triggers banner

### Phase 4 — Historical Data (Separate Investigation)

- [ ] Identify historical data provider (different website from Dribl)
- [ ] Design and implement new crawl command in `bin/commands/`
- [ ] Backfill available past seasons into year-scoped paths

## Critical Files

| File | Change |
|---|---|
| `bin/commands/syncFixtures.ts` | Write to `data/matches/{slug}/{year}.json` |
| `bin/commands/syncTable.ts` | Write to `data/table/{slug}/{year}.json` |
| `src/lib/matches/matchService.ts` | Add year param + `getAvailableSeasons` |
| `src/lib/matches/tableService.ts` | Add year param + `getAvailableSeasons` |
| `src/app/(site)/football/teams/[slug]/matches/page.tsx` | Redirect to latest season |
| `src/app/(site)/football/teams/[slug]/matches/[season]/page.tsx` | New (moved from above) |
| `src/app/(site)/football/teams/[slug]/table/page.tsx` | Redirect to latest season |
| `src/app/(site)/football/teams/[slug]/table/[season]/page.tsx` | New (moved from above) |
| `src/components/teams/TeamDetailNav.tsx` | Include active season in nav links |

## Verification

1. `pnpm run type:check && pnpm run build` — no errors
2. `/football/teams/state-league-2-mens/matches` redirects → `.../matches/2026`
3. Season selector tabs render and clicking switches year in URL
4. Off-season banner visible when `season < currentYear`
5. `pnpm run test:e2e` passes

## Unresolved Questions

- Which website provides historical fixture/result data? What format?
- Does Dribl expose historical ladder/table data for past seasons via API?
- How far back does the club want history (1 year? 3 years? all available)?
