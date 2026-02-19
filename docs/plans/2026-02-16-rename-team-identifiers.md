# Rename Team Identifiers

**Created:** 2026-02-16
**Status:** ✅ Complete

## Purpose

Rename two team identifiers to match actual team names:

1. `seniors-mens` → `state-league-2-men-s-north-west`
2. `reserves-mens` → `state-league-2-men-s-north-west-reserves`

## Current State

### seniors-mens

- External ID: `'6lNbpDpwdx'` (remains same)
- Data file: `data/matches/seniors-mens.json` (132 fixtures)
- Usage: Homepage hardcoded, matchService mapping, GitHub Actions

### reserves-mens

- NOT in matchService mapping (missing external ID)
- Data file: `data/matches/reserves-mens.json`
- Usage: GitHub Actions only

## Routing Architecture

- Dynamic routes: `/football/teams/[slug]` and `/football/teams/[slug]/matches`
- Slugs driven by Sanity CMS (auto-generated from team name)
- Match fixtures use slug as filename: `data/matches/{slug}.json`
- External ID mapping: `matchService.ts` maps slug → Dribl external ID

## Implementation Tasks

### 1. Data Files

- [x] Rename `data/matches/seniors-mens.json` → `data/matches/state-league-2-men-s-north-west.json`
- [x] Rename `data/matches/reserves-mens.json` → `data/matches/state-league-2-men-s-north-west-reserves.json`
- [ ] Delete old data files after verification

### 2. Configuration

- [x] Update `src/lib/matches/matchService.ts:13-15` - teamExternalIds mapping
  - Change `'seniors-mens': '6lNbpDpwdx'` → `'state-league-2-men-s-north-west': '6lNbpDpwdx'`
  - Add `'state-league-2-men-s-north-west-reserves': '6lNbpDpwdx'`

### 3. Frontend (Homepage)

- [x] Update `src/app/(site)/page.tsx:47` - `getNextMatch('seniors-mens')` → `getNextMatch('state-league-2-men-s-north-west')`
- [x] Update `src/app/(site)/page.tsx:93` - `teamSlug="seniors-mens"` → `teamSlug="state-league-2-men-s-north-west"`

### 4. CI/CD Pipeline

- [x] Update `.github/workflows/crawl.yml:30,37` - seniors-mens → state-league-2-men-s-north-west (2 occurrences)
- [x] Update `.github/workflows/crawl.yml:32,39` - reserves-mens → state-league-2-men-s-north-west-reserves (2 occurrences)

### 5. Documentation

- [x] Update `bin/wsc.ts:26,54` - Update examples
- [x] Update `.claude/skills/dribl-crawling/SKILL.md:93,117,242` - Update examples
- [x] Update `tests/search.spec.ts:15,17` - Update E2E test to search for new team name

### 6. Verification

- [x] Run `npm run type:check`
- [x] Run `npm run lint`
- [x] Run `npm run format`
- [x] Run `npm run build`
- [ ] Test dev server (port 3003)
  - Homepage match countdown works
  - `/football/teams/state-league-2-men-s-north-west` loads
  - `/football/teams/state-league-2-men-s-north-west/matches` shows fixtures
- [x] Run `npm run test:e2e` (14/14 passed - also fixed pre-existing search test issues)

### 7. Sanity CMS (Manual - Post Implementation)

- [ ] Login to Sanity Studio at `http://localhost:3003/studio`
- [ ] Update "Seniors Men's" team name to trigger slug regeneration
- [ ] Update "Reserves Men's" team name to trigger slug regeneration
- [ ] Verify new slugs match expected values

## File Changes

| File                                     | Action                                                  |
| ---------------------------------------- | ------------------------------------------------------- |
| `data/matches/seniors-mens.json`         | Rename to state-league-2-men-s-north-west.json          |
| `data/matches/reserves-mens.json`        | Rename to state-league-2-men-s-north-west-reserves.json |
| `src/lib/matches/matchService.ts`        | Edit - update mapping                                   |
| `src/app/(site)/page.tsx`                | Edit - update hardcoded refs (2 places)                 |
| `.github/workflows/crawl.yml`            | Edit - update slugs (4 occurrences)                     |
| `bin/wsc.ts`                             | Edit - update examples (2 places)                       |
| `.claude/skills/dribl-crawling/SKILL.md` | Edit - update examples (3 places)                       |
| `tests/search.spec.ts`                   | Edit - update E2E test (2 places)                       |

## Notes

- External ID `'6lNbpDpwdx'` represents Williamstown SC club (all teams use same ID)
- Old data files will be deleted after successful verification
- Sanity CMS slugs auto-regenerate when team names are updated
