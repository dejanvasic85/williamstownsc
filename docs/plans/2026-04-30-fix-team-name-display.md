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

- Fixtures must display the specific team name (e.g. "Williamstown SC - White") not just club name
- `EnrichedFixture` must carry team names alongside club data
- Backwards-compatible: existing fixture JSON files without team names should still work (fall back to `Club.displayName`)
- Must re-sync all fixture data to populate team names in stored JSON

## Todo

- [ ] Add optional `homeTeamName` and `awayTeamName` fields to `fixtureSchema` in `src/types/matches.ts`
- [ ] Update `EnrichedFixture` type to include `homeTeamName` and `awayTeamName` fields
- [ ] Update `fixtureTransformService.ts` to capture raw `home_team_name` / `away_team_name` from Dribl attributes
- [ ] Update `matchService.ts` `enrichFixtures` to populate `homeTeamName`/`awayTeamName` from fixture data (fall back to `Club.displayName`)
- [ ] Update `MatchCardDesktop.tsx` to use `fixture.homeTeamName` / `fixture.awayTeamName` instead of `fixture.homeTeam.displayName`
- [ ] Update `MatchCardMobile.tsx` same
- [ ] Re-run `pnpm run sync:fixtures` to regenerate all fixture JSON files with team names
- [ ] Run checks: format, lint, type:check, build, test:e2e
- [ ] Commit and push

## Unresolved Questions

- Should we also fix `MatchCountdownSection` / `TeamMatchesPreview` if they render team names?
- Do we want to strip common suffixes from team names (e.g. remove the club name prefix to just show "Seniors")?
