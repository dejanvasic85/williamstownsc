# Team Page Enhancement Plan

**Created:** 2026-03-29
**Status:** 🔄 In Progress

## Context

Team detail page currently shows description, players, coaching staff only. Need to add fixture/table links, next match, previous result, and make coaching staff required.

## Requirements

- Fixture links (internal `/matches` or external URL) — same logic as TeamListItem
- Table link (external URL) — same logic as TeamListItem
- Previous match result (compact score card)
- Next match (date, opponents, venue — simpler than homepage countdown)
- Coaching staff (already exists; make required in schema)
- Player list (already exists)
- Team must have coaches as required field (min 1 validation)

## Critical Files

| File                                            | Change                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| `src/sanity/schema/team.ts`                     | Add `min(1)` validation to `coachingStaff`                       |
| `src/lib/content/teamDetail.ts`                 | Add `tableUrl` to query (already has `fixturesUrl`)              |
| `src/lib/matches/matchService.ts`               | Extract WSC external ID via config; add `getPreviousMatch(slug)` |
| `src/lib/config.ts`                             | Add `clubConfig` schema with `wscClubExternalId`                 |
| `src/app/(site)/football/teams/[slug]/page.tsx` | Fetch next/previous match + fixture data; render new sections    |
| `src/components/teams/TeamMatchesPreview.tsx`   | NEW: next match + previous result layout                         |

## Implementation Tasks

- [ ] **Save plan** to `docs/plans/2026-03-29-team-page-enhancement.md`
- [ ] **Sanity schema**: Add `validation: (Rule) => Rule.min(1)` to `coachingStaff` array
- [x] **`src/lib/config.ts`**: Add `clubConfig` with hardcoded `wscClubExternalId: '6lNbpDpwdx'` and `getClubConfig()` — ID is club-specific constant, not environment-specific config
- [ ] **`teamDetail.ts`**: Add `tableUrl` to `teamDetailQuery` projection
- [ ] **`matchService.ts`**:
  - Replace `teamExternalIds` map with `getClubConfig().wscClubExternalId` from config
  - Add `getPreviousMatch(teamSlug: string): Promise<EnrichedFixture | null>` — returns most recent completed fixture (`status === 'complete'`) where `matchDateTime < now`
- [ ] **`TeamMatchesPreview` component** (`src/components/teams/TeamMatchesPreview.tsx`):
  - Server component
  - Props: `nextMatch`, `previousMatch`, `teamSlug`
  - Layout: two cards side by side (md:grid-cols-2) — "Next Match" and "Last Result"
  - Next Match card: team logos, date/time, venue (no countdown)
  - Last Result card: team logos + score, date
- [ ] **Team page**:
  - Parallel fetch: `getTeamBySlug`, `hasFixtures`, `getNextMatch`, `getPreviousMatch`
  - Add fixture/table quick-action buttons (port logic from `TeamListItem`)
  - Add `TeamMatchesPreview` section before coaching staff (when local fixtures exist)
  - Keep existing coaching staff + player sections

## Page Layout Order

1. Heading + description
2. Fixture & table action buttons (if applicable)
3. Next match + previous result (if local fixtures exist)
4. Coaching staff
5. Players

## Reusable Patterns

- Fixture/table button logic: `src/components/teams/TeamListItem.tsx:62-95`
- Match display layout: `src/components/matches/MatchCardDesktop.tsx`
- Next match fetching: `src/lib/matches/matchService.ts` (`getNextMatch`)

## Verification

```bash
npm run lint && npm run format && npm run type:check
# Navigate to /football/teams/state-league-2-men-s-north-west
# Verify: fixture link, table link, next match card, previous result card, coaches, players
# Verify: team with no local fixtures shows only external links (no match cards)
# Verify: mobile responsive layout
# Verify: dark mode
```
