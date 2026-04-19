---
title: 'League Ladder Crawler'
number: '01'
status: draft
priority: high
phase: ''
created: '2026-04-19'
updated: '2026-04-19'
owner: 'Dejan Vasic'
idea: '2026-04-league-ladder-crawler.md'
plan: ''
depends-on: []
domain: engineering
budget: ''
tags: [crawler, ladder, fixtures, dribl, playwright]
---

## Problem

The site links to an external Dribl URL for the league ladder. Users leave the site to check standings. The ladder should be an internal page with crawled data, consistent with how fixtures/results work.

## Current State

- `src/sanity/schema/team.ts:188` — `tableUrl` field stores the Dribl ladder URL (e.g. `https://mc-api.dribl.com/api/ladders?...`)
- `src/components/teams/TeamDetailNav.tsx:70` — "Table" nav tab renders as external link when `tableUrl` is defined
- `src/app/(site)/football/teams/[slug]/matches/` — matches sub-route exists; no ladder sub-route exists
- `data/matches/` — one JSON file per team slug; no `data/ladder/` directory
- `bin/commands/crawlFixtures.ts` — API interception pattern to replicate for ladder
- `bin/wsc.ts` — CLI with `crawl` and `sync` command groups
- `src/lib/content/teams.ts` — `getCrawlableTeams()` fetches teams with `enableFixturesCrawler == true`; `tableUrl` already returned by `teamsQuery`

## Requirements

### 1. Zod schema for external ladder API response

Model the response from `https://mc-api.dribl.com/api/ladders`. Add to `src/types/ladder.ts`:

- `ExternalLadderEntry`: position, team name, team logo, played, wins, draws, losses, goals for, goals against, goal difference, points
- `ExternalLadderApiResponse`: wrapping schema with `data: ExternalLadderEntry[]`

### 2. Crawl command — `crawl:ladder`

New file `bin/commands/crawlLadder.ts`:

- Accept options: `team` (slug), `tableUrl` (Dribl ladder API URL)
- When no `--team` provided, read all crawlable teams from Sanity via `getCrawlableTeams()` (extend query to also return `tableUrl`)
- Launch Playwright browser, navigate to a Dribl page, intercept the `mc-api.dribl.com/api/ladders` network response — the full URL shape is `https://mc-api.dribl.com/api/ladders?date_range=default&season=nPmrj2rmow&ladder_type=regular&competition=wOmejBq1N0&league=PmjBD66BmZ&tenant=w8zdBWPmBX&require_pools=true` (query params vary per team; the `tableUrl` stored in Sanity contains the correct params for each team)
- Validate response with `ExternalLadderApiResponse` Zod schema
- Write raw response to `data/external/ladder/{team-slug}.json`

Register in `bin/wsc.ts` under the `crawl` group with `--team` and `--table-url` options.

Add npm scripts to `package.json`:
- `crawl:ladder` — with browser GUI
- `crawl:ladder:ci` — headless

### 3. Sync command — `sync:ladder`

New file `bin/commands/syncLadder.ts`:

- Read `data/external/ladder/{team-slug}.json`
- Transform each entry to canonical `LadderEntry` type (camelCase, typed fields)
- Write to `data/ladder/{team-slug}.json` as `LadderData { season, competition, entries: LadderEntry[] }`

Register in `bin/wsc.ts` under the `sync` group.

Add npm scripts:
- `sync:ladder`
- `sync:ladder:ci`

### 4. Canonical types

Add to `src/types/ladder.ts`:

```ts
type LadderEntry = {
  position: number
  teamId: string
  teamName: string
  logoUrl: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

type LadderData = {
  season: number
  competition: string
  entries: LadderEntry[]
}
```

### 5. Ladder service

New file `src/lib/matches/ladderService.ts`:

- `getLadderForTeam(slug: string): Promise<LadderData>` — reads `data/ladder/{slug}.json`

### 6. Internal ladder page

New route: `src/app/(site)/football/teams/[slug]/ladder/page.tsx`

- Server component, calls `getLadderForTeam(slug)`
- Renders full standings table: Pos, Team (logo + name), P, W, D, L, GF, GA, GD, Pts
- Highlight the WSC row (match by team name or ID)
- Mobile-first, responsive, light/dark theme

### 7. Update TeamDetailNav

In `src/components/teams/TeamDetailNav.tsx`:

- Change the "Table" tab: when `tableUrl` is defined, render as internal link to `/football/teams/{slug}/ladder` instead of external URL
- Remove `isExternal` flag for this tab

### 8. Update Sanity content query

In `src/lib/content/teams.ts`, extend `getCrawlableTeams()` GROQ query to include `tableUrl` so the crawl command can read it without separate Sanity calls.

## Implementation Notes

- The Dribl ladder API URL contains query params (season, competition, league, tenant) — these are already stored in `tableUrl` in Sanity, no new schema needed
- Follow the same Playwright network interception pattern as `crawlFixtures.ts` (intercept response, validate with Zod, write JSON)
- `data/ladder/` is a new top-level directory under `data/`, consistent with `data/matches/`
- In future this data moves to a database; the service layer (`ladderService.ts`) abstracts the storage so that migration only touches one file

## Acceptance Criteria

- [ ] `npm run crawl:ladder` intercepts Dribl API and writes `data/external/ladder/{team-slug}.json`
- [ ] `npm run sync:ladder` transforms and writes `data/ladder/{team-slug}.json` with correct canonical shape
- [ ] `/football/teams/{slug}/ladder` page renders full standings table
- [ ] WSC team row is visually highlighted in the table
- [ ] "Table" nav tab on team detail page links internally (not externally) when ladder data exists
- [ ] Page is mobile responsive and works in light and dark themes
- [ ] `npm run type:check`, `npm run lint`, `npm run build` all pass
- [ ] E2E test covers ladder page render for at least one team
