---
title: 'League Table Crawler'
number: '01'
status: draft
priority: high
phase: ''
created: '2026-04-19'
updated: '2026-04-19'
owner: 'Dejan Vasic'
idea: '2026-04-league-table-crawler.md'
plan: ''
depends-on: []
domain: engineering
budget: ''
tags: [crawler, table, fixtures, dribl, playwright]
---

## Problem

The site links to an external Dribl URL for the league table. Users leave the site to check standings. The table should be an internal page with crawled data, consistent with how fixtures/results work.

## Current State

- `src/sanity/schema/team.ts:188` — `tableUrl` field stores the Dribl table URL (e.g. `https://mc-api.dribl.com/api/ladders?...`)
- `src/components/teams/TeamDetailNav.tsx:70` — "Table" nav tab renders as external link when `tableUrl` is defined
- `src/app/(site)/football/teams/[slug]/matches/` — matches sub-route exists; no table sub-route exists
- `data/matches/` — one JSON file per team slug; no `data/table/` directory
- `bin/commands/crawlFixtures.ts` — API interception pattern to replicate for table
- `bin/wsc.ts` — CLI with `crawl` and `sync` command groups
- `src/lib/content/teams.ts` — `getCrawlableTeams()` fetches teams with `enableFixturesCrawler == true`; `tableUrl` already returned by `teamsQuery`

## Requirements

### 1. Zod schema for external table API response

Model the response from `https://mc-api.dribl.com/api/ladders`. Add to `src/types/table.ts`:

- `ExternalTableEntry`: position, team name, team logo, played, wins, draws, losses, goals for, goals against, goal difference, points
- `ExternalTableApiResponse`: wrapping schema with `data: ExternalTableEntry[]`

### 2. Crawl command — `crawl:table`

New file `bin/commands/crawlTable.ts`:

- Accept options: `team` (slug), `tableUrl` (Dribl table API URL)
- When no `--team` provided, read all crawlable teams from Sanity via `getCrawlableTeams()` (extend query to also return `tableUrl`)
- Launch Playwright browser, navigate to a Dribl page, intercept the `mc-api.dribl.com/api/ladders` network response — the full URL shape is `https://mc-api.dribl.com/api/ladders?date_range=default&season=nPmrj2rmow&ladder_type=regular&competition=wOmejBq1N0&league=PmjBD66BmZ&tenant=w8zdBWPmBX&require_pools=true` (query params vary per team; the `tableUrl` stored in Sanity contains the correct params for each team)
- Validate response with `ExternalTableApiResponse` Zod schema
- Write raw response to `data/external/table/{team-slug}.json`

Register in `bin/wsc.ts` under the `crawl` group with `--team` and `--table-url` options.

Add npm scripts to `package.json`:
- `crawl:table` — with browser GUI
- `crawl:table:ci` — headless

### 3. Sync command — `sync:table`

New file `bin/commands/syncTable.ts`:

- Read `data/external/table/{team-slug}.json`
- Transform each entry to canonical `TableEntry` type (camelCase, typed fields)
- Write to `data/table/{team-slug}.json` as `TableData { season, competition, entries: TableEntry[] }`

Register in `bin/wsc.ts` under the `sync` group.

Add npm scripts:
- `sync:table`
- `sync:table:ci`

### 4. Canonical types

Add to `src/types/table.ts`:

```ts
type TableEntry = {
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

type TableData = {
  season: number
  competition: string
  entries: TableEntry[]
}
```

### 5. Table service

New file `src/lib/matches/tableService.ts`:

- `getTableForTeam(slug: string): Promise<TableData>` — reads `data/table/{slug}.json`

### 6. Internal table page

New route: `src/app/(site)/football/teams/[slug]/table/page.tsx`

- Server component, calls `getTableForTeam(slug)`
- Renders full standings table: Pos, Team (logo + name), P, W, D, L, GF, GA, GD, Pts
- Highlight the WSC row (match by team name or ID)
- Mobile-first, responsive, light/dark theme

### 7. Update TeamDetailNav

In `src/components/teams/TeamDetailNav.tsx`:

- Change the "Table" tab: when `tableUrl` is defined, render as internal link to `/football/teams/{slug}/table` instead of external URL
- Remove `isExternal` flag for this tab

### 8. Update Sanity content query

In `src/lib/content/teams.ts`, extend `getCrawlableTeams()` GROQ query to include `tableUrl` so the crawl command can read it without separate Sanity calls.

## Implementation Notes

- The Dribl table API URL contains query params (season, competition, league, tenant) — these are already stored in `tableUrl` in Sanity, no new schema needed
- Follow the same Playwright network interception pattern as `crawlFixtures.ts` (intercept response, validate with Zod, write JSON)
- `data/table/` is a new top-level directory under `data/`, consistent with `data/matches/`
- In future this data moves to a database; the service layer (`tableService.ts`) abstracts the storage so that migration only touches one file

## Available Skills

- **dribl-crawling** — documents the Dribl Playwright interception pattern (Cloudflare bypass, API interception, Zod validation, data merging). Use when implementing `crawlTable.ts` to follow established conventions.
- **agent-browser** — use to drive the live site at `http://localhost:3003` to verify the table page renders correctly, the WSC row highlights, the nav tab links internally, and responsive/dark mode behaviour looks right.

## Acceptance Criteria

- [ ] `npm run crawl:table` intercepts Dribl API and writes `data/external/table/{team-slug}.json`
- [ ] `npm run sync:table` transforms and writes `data/table/{team-slug}.json` with correct canonical shape
- [ ] `/football/teams/{slug}/table` page renders full standings table
- [ ] WSC team row is visually highlighted in the table
- [ ] "Table" nav tab on team detail page links internally (not externally) when table data exists
- [ ] Page is mobile responsive and works in light and dark themes
- [ ] `npm run type:check`, `npm run lint`, `npm run build` all pass
- [ ] E2E test covers table page render for at least one team
