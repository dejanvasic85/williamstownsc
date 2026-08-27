# Matchday SDK v2 Upgrade

**Created:** 2026-08-27
**Status:** Pending

## Purpose

Upgrade `@dejanvasic85/matchday-sdk` from 0.2.0 to 2.x. The API already serves paged list
responses, so the current code is broken in production; the same upgrade also lets us delete the
full-catalog fetch-and-join that exists only to work around endpoints v2 replaces.

## Background

### Currently broken

`GET /clubs`, `/teams`, `/competitions`, `/seasons`, `/leagues` return `{ data, nextCursor }` as of
SDK 2.0.0. Our 0.2.0 code calls `.map()` on that object:

```
TypeError: h.data.map is not a function
  at matchdayClubService.ts:51   (clubsResult.data.map)
  at matchdayClubService.ts:102  (getFixtureTeamsById)
  at matchdayMatchService.ts:100 (loadFixturesForLeague)
```

There is no JSON fallback on the matchday path: `matchService.ts:133` and `tableService.ts:39`
catch, report to Sentry, and return `null`. Every leagueId-backed team currently renders blank
fixtures and table pages.

### What v2 replaces

| v2 capability                             | Replaces                                                             |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `getLeagueTeams(client, leagueId)`        | full `/teams` + `/clubs` catalog join (~6500 teams, 2.4 MB)          |
| `League.competition` / `.season` embedded | 2 extra GETs in league meta, 2 catalog fetches in the league picker  |
| `getClubLeagues(client, clubId)`          | manual `/leagues?clubId=`, pages internally, adds table-less leagues |
| `unwrap` / `unwrapOrThrow`                | hand-rolled `if (error \|\| !data) throw` in all 5 services          |
| client `timeoutMs` / `retries`            | `matchdayRequestTimeoutMs` + `AbortSignal.timeout()` plumbing        |

`getLeagueOverview` is available but not adopted here. Calls are fast enough that one round-trip
per league page is not worth the coupling; keep it in mind for future work.

### Caching

Remove every `unstable_cache` wrapper. The API caches upstream now, and the workaround they exist
for (redundant 2.4 MB catalog fetches per build) disappears with Phase 2.

**Companion change, do not skip:** those wrappers carry `revalidate: 300`, and that is what
currently sets the page revalidate window. The only `export const revalidate` on these routes is
`layout.tsx:12` at 86400. Build output confirms it:

```
/football/teams/under-12b-boys     1d   <- JSON-backed
/football/teams/under-18a-boys     5m   <- matchday-backed, 5m comes from unstable_cache
```

Removing the wrappers alone pushes matchday fixtures and tables from 5-minute to 24-hour
staleness. 300 is more aggressive than needed given `/api/revalidate` exists and the site rebuilds
every few days, so set `export const revalidate = 3600` on the matches/table routes only. Weekend
results land within the hour; JSON-backed teams stay on the layout's 86400.

### Sequencing rationale

Do **not** fix the paging breaks first. Most code needing a paging fix is code v2 lets us delete:
patching `/teams` + `/clubs` paging in `matchdayClubService` is wasted work when Phase 2 removes
that join entirely.

## Requirements

- Target 2.1.0 once matchday PR #185 publishes. Plan works unchanged on 2.0.0 if we start sooner.
- matchday PR #185 (`listAll*` auto-paging helpers) is a no-op here: it adds full-catalog walk
  helpers, and this plan eliminates every full-catalog walk we have. `getLeagueOverview` and
  `getLeagueTeams` are untouched by it; `getClubLeagues` keeps its signature.
- Handle the `Team` discriminated union (`type: "club" | "unaffiliated"`); `club` is present only
  on `"club"`.
- Preserve existing behaviour for non-matchday (JSON-backed) teams. Out of scope entirely.
- Phase 4 changes what appears in the Studio league picker (MiniRoos now included). Verify
  separately.
- Land in PR #841, which introduced this code and ships broken without it.

## Todo

### Phase 0: bump and survey

- [ ] Bump `@dejanvasic85/matchday-sdk` to 2.x in `package.json`, `pnpm install`
- [ ] Run `pnpm run type:check`, record every break (expect `leagueOptionService`,
      `matchdayClubService`)

### Phase 1: client config

- [ ] Move timeout into `createMatchdayClient({ timeoutMs, retries, retryDelayMs })`
- [ ] Keep `matchdayRequestTimeoutMs` exported only while callers still reference it

### Phase 2: league-scoped teams (highest value, fixes the live break)

- [ ] Replace the `/teams` + `/clubs` join with `getLeagueTeams(client, leagueId)`
- [ ] Change `getFixtureTeamsById()` to league-scoped; update both call sites
- [ ] Narrow on `team.type === 'club'`, log and skip `unaffiliated`
- [ ] Verify fixtures and table render for a matchday-backed team

### Phase 3: league meta

- [ ] Drop `/competitions/{id}` + `/seasons/{id}`, read embedded `competition` / `season`

### Phase 4: league picker

- [ ] Replace manual `/leagues?clubId=` with `getClubLeagues(client, clubId)`
- [ ] Delete the `/competitions` + `/seasons` catalog fetches and `buildLabel` id fallbacks
- [ ] Verify Studio picker, confirm MiniRoos age groups now appear

### Phase 5: drop local caching

- [ ] Remove `unstable_cache` from club, league meta, match and table services
- [ ] Add `export const revalidate = 3600` to the matches/table routes so freshness holds
- [ ] Confirm build output shows 1h (not 1d) for matchday-backed matches/table routes

### Phase 6: delete the warm-up script

- [ ] Delete `bin/warmMatchdayApi.ts`, calls are fast enough that pre-warming is pointless
- [ ] Drop `warm:matchday` from `package.json` scripts and from the `build` script

### Cross-cutting

- [ ] Replace hand-rolled error checks with `unwrap` / `unwrapOrThrow` as each service is touched

### Verification

- [ ] Run `pnpm run format`
- [ ] Run `pnpm run lint`
- [ ] Run `pnpm run type:check`
- [ ] Run `pnpm run build`
- [ ] Run `pnpm run test:e2e`
- [ ] Run `/caveman-review`

## Files

| File                                            | Change                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| `package.json`                                  | SDK 0.2.0 to 2.x, drop `warm:matchday` from scripts and `build`   |
| `src/lib/matchday/matchdayClient.ts`            | timeout/retries into client options                               |
| `src/lib/matchday/matchdayClubService.ts`       | catalog join to `getLeagueTeams`, drop cache, shrinks to a mapper |
| `src/lib/matchday/matchdayLeagueMetaService.ts` | 3 requests to 1, drop cache                                       |
| `src/lib/matchday/leagueOptionService.ts`       | `getClubLeagues`, drop catalog fetches and label fallbacks        |
| `src/lib/matchday/matchdayMatchService.ts`      | league-scoped teams lookup, `unwrap`, drop cache                  |
| `src/lib/matchday/matchdayTableService.ts`      | league-scoped teams lookup, `unwrap`, drop cache                  |
| `src/app/(site)/football/teams/[slug]/**`       | explicit `revalidate = 3600` on matches/table routes              |
| `bin/warmMatchdayApi.ts`                        | delete                                                            |

## Decisions

- MiniRoos picker change ships in #841, it is a fix rather than a feature.
- `revalidate = 3600` on matches/table routes only, not a lower shared `layout.tsx` value.
