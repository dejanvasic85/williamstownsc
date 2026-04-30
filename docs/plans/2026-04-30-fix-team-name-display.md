# Fix Team Name Display in Fixtures

## Purpose

When two WSC teams are in the same league (e.g. under-11-girls, under-11-boys-joeys), fixtures show
"Williamstown SC" for both teams instead of distinguishing them (e.g. "Williamstown SC - White" vs
"Williamstown SC - Gold"). The table correctly shows full team names because it uses team-level data
from the Dribl table API, but fixtures lose the team name during transformation.

## Root Cause

The data pipeline discards the original team name:

1. Dribl API → `home_team_name: "Williamstown SC Seniors"` (team-level)
2. `fixtureTransformService.ts` maps team name → `homeTeamId` (club-level ID `6lNbpDpwdx`) — **team name discarded**
3. Fixture JSON only stores `homeTeamId`, not team name
4. `matchService.ts` enriches via `getClubByExternalId()` → returns `Club { displayName: "Williamstown SC" }` for all WSC teams
5. Match cards render `fixture.homeTeam.displayName` → always "Williamstown SC"

Affected leagues (multiple same-club teams): `under-11-girls`, `under-11-girls-white`,
`under-11-boys-joeys-lee-hudson`, `under-11-boys-joeys-chris-matt`, `under-7-boys-wallabies-matt`,
plus many others where non-WSC clubs also have same-club-vs-same-club fixtures.

## Requirements

- Seniors teams → display club name only (e.g. "Williamstown SC Seniors" → "Williamstown SC")
- All other teams → display full team name from Dribl (e.g. "Williamstown Masters")
- Display name resolution: if team name ends with " Seniors" → use `Club.displayName`; otherwise use team name
- `EnrichedFixture` must carry resolved display names
- Backwards-compatible: existing fixture JSON without team names falls back to `Club.displayName`
- Must re-sync all fixture data to populate team names in stored JSON

## Display Name Logic

```
resolveTeamDisplayName(teamName, club):
  if teamName ends with " Seniors" → club.displayName
  else if teamName is set → teamName
  else → club.displayName
```

## Todo

- [ ] Add optional `homeTeamName` and `awayTeamName` to `fixtureSchema` in `src/types/matches.ts`
- [ ] Add `resolveTeamDisplayName(teamName, club)` to `src/lib/clubService.ts`
- [ ] Update `EnrichedFixture` type: replace `homeTeam`/`awayTeam` `Club` lookup display with resolved names, or add `homeTeamDisplayName`/`awayTeamDisplayName` fields
- [ ] Update `fixtureTransformService.ts` to capture `home_team_name` / `away_team_name`
- [ ] Update `matchService.ts` `enrichFixtures` to call `resolveTeamDisplayName` and set on `EnrichedFixture`
- [ ] Update `MatchCardDesktop.tsx` and `MatchCardMobile.tsx` to use resolved display names
- [ ] Check `MatchCountdownSection` and `TeamMatchesPreview` for same issue
- [ ] Re-run `pnpm run sync:fixtures` to regenerate fixture JSONs with team names
- [ ] Run checks: format, lint, type:check, build, test:e2e
- [ ] Commit and push
