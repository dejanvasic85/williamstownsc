# Matchday-backed fixtures/table/results (issue #818, scoped to under-12-girls)

## Purpose

Swap `matchService.ts`/`tableService.ts`/`clubService.ts` from local JSON to the matchday API,
for teams that have `matchday.leagueId` set — dual-path, not a full cutover. Only Under 12 Girls
has `leagueId` today; every other team must render byte-for-byte identical to current prod,
untouched, still reading local JSON.

## Requirements / constraints

- Dual-path trigger: presence of `team.matchday.leagueId` (confirmed with user, not a hardcoded
  slug allowlist) — teams pick up the new path automatically as they're backfilled later.
- Output shapes (`EnrichedFixture`, `TableData`, `Club`) must not change — downstream components
  (`TeamMatchesPreview`, `MatchCardMobile`, table page, calendar route) stay untouched.
- Matchday fixtures/table only carry team ids (`tea_...`), not club data — need `GET /teams` +
  `GET /clubs` (full catalogs, same "no batch-by-id filter, small catalog, join in memory"
  tradeoff already accepted for `leagueOptionService.ts`) to resolve opponent name/logo/etc.
- `Club.externalId` becomes the matchday club id (`clb_...`) for matchday-sourced fixtures instead
  of the Dribl hash id — fine, it's only ever used as an internal join/dedupe key, never round-
  tripped back to Dribl.
- `coordinates` field is a `"lat,lng"` string (see `fixtureTransformService.test.ts`) built from
  matchday's separate `latitude`/`longitude` numbers; `address` maps from matchday's `venue`.
- `wscClubDriblId` (`getClubConfig()`) — used in `matchService.ts`, `LeagueTable.tsx`, and the
  calendar route to identify "our own club" within fixture/table rows — is a hardcoded Dribl id.
  For matchday-sourced data, the equivalent is `siteSettings.matchday.clubId`. Not a judgment
  call, just needs threading through: matchday-backed code paths compare against the matchday
  clubId, not `wscClubDriblId`.
- `TableEntry` from matchday only has `teamId` (no team/club name) — every row, not just ours,
  needs the same `/teams` + `/clubs` join as fixtures.

## Decisions

1. **Fixture status mapping**: `completed` → `'complete'` (existing string). `postponed` gets its
   own explicit handling (same "Postponed" badge `MatchCardMobile` already shows for
   `'washout reschedule'` — broadening that check rather than adding a parallel one).
   `cancelled` gets a new distinct "Cancelled" badge (different meaning than postponed — won't be
   rescheduled). `in_progress`/`scheduled` pass through unstyled (existing default/upcoming look).
   Calendar route: `completed` → `CONFIRMED`, `cancelled` → `CANCELLED` (real iCal status), else
   `TENTATIVE`.
2. **leagueId plumbing**: add `matchday{leagueId}` to the existing `teamDetailQuery` projection
   for call sites that already fetch the team (team page, table page). Add a small, separate
   `getTeamLeagueId(slug)` query in `lib/content/teamDetail.ts` for the direct-call sites
   (`getFixturesForTeam`/`getNextMatch`/`getPreviousMatch`) that don't otherwise need the team doc.

## Todo

- [x] Add `matchday.leagueId` to `teamDetailQuery` projection; add `getTeamLeagueId(slug)` for the direct-call sites (`cache()`-wrapped at the source so every caller shares one query per request)
- [x] New `src/lib/matchday/matchdayClubService.ts` — fetch+join `/teams` + `/clubs`, map to existing `Club` type. Added `public/img/club-placeholder.svg` fallback for the (nullable) matchday club logo.
- [x] New `src/lib/matchday/matchdayMatchService.ts` — `GET /leagues/{id}/fixtures`, map to `EnrichedFixture[]`, byes via `isBye`, status mapping per Decisions
- [x] New `src/lib/matchday/matchdayTableService.ts` — `GET /leagues/{id}/table`, map to `TableData`
- [x] New `src/lib/matchday/matchdayLeagueMetaService.ts` — competition/season name resolution shared by fixtures + table
- [x] `getMatchdayClubId()` — the matchday equivalent of `wscClubDriblId` — lives in `src/lib/content/siteSettings.ts`, next to `getSiteSettings()` which it wraps (moved from a short-lived `matchdaySiteConfig.ts` during the reorg below; it's a Sanity reader, not a matchday API wrapper)
- [x] New `src/lib/matches/fixtureDateTimeService.ts` — extracted `parseFixtureDateTime` to a neutral module (avoids a circular import between `matchService.ts` and `matchdayMatchService.ts`)
- [x] Branch `matchService.ts`/`tableService.ts` public functions on `leagueId` presence; use `siteSettings.matchday.clubId` instead of `wscClubDriblId` on the matchday path
- [x] `MatchCardMobile` + `MatchCardDesktop`: broaden postponed check, add cancelled badge
- [x] Calendar route: cancelled → `CANCELLED` status; matchday-aware own-club filter
- [x] `LeagueTable.tsx`: verified no change needed — matchday's club name ("Williamstown SC") already matches the existing substring check against `wscClubDriblName` ("Williamstown")
- [x] All matchday service functions `cache()`-wrapped (caveman-review finding: layout.tsx + page.tsx both call `getTeamMatches`/`getTableForTeam` per request, which would otherwise double the real API calls for a matchday-backed team)
- [x] Verified fixture/next-match/previous-match/table mapping against the real matchday API directly (leagueId `lea_gHqdp7GCkAGS`, bypassing Sanity) — all correct, including the real WSC next/previous match
- [x] `pnpm run format`/`lint`/`type:check`/`build` all pass; `test:e2e` 22/23 (1 known local-only Playwright quirk, unrelated — see memory)
- [x] Reorg (user review feedback): moved `getMatchdayClubId` into `lib/content/siteSettings.ts`; split the pure `resolveMatchdayNextMatch`/`resolveMatchdayPreviousMatch` out of `matchdayMatchService.ts` into a new `matchResolverService.ts`, so every `matchday*Service.ts` file is now fetch+map only, no mixed-in pure logic
- [x] Coderabbit fixes on #841: `getTeamLeagueId` no longer swallows Sanity errors (a lookup failure must not be treated as "not configured for matchday" and silently fall back to stale local JSON); matchday API failures in `matchService.ts`/`tableService.ts` now caught and degrade to the same null/false/empty contract the local path uses instead of a 500; `matchdayClubService` uses `safeParse` so one malformed club record doesn't fail the whole catalog; `matchdayTableService` keeps a row with a placeholder name/logo instead of dropping it (was leaving gaps in ladder position numbering); fixture status strings centralized in `fixtureStatusService.ts`; kickoff time formatting uses `hourCycle: 'h23'` instead of `hour12: false`; `matchdayRequestTimeoutMs` centralized in `matchdayClient.ts`
- [ ] User fixing the `under-12-girls` Sanity save, then testing `/football/teams/under-12-girls` (team/matches/table pages) locally
- [ ] Remove the legacy Dribl-crawler code path once the above is confirmed working (same PR)

## Unresolved questions

- None — both open questions resolved with the user, `wscClubDriblId` fix folded into Todo above.
