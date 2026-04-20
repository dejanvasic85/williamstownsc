---
title: 'League Table Crawler: Execution Plan'
number: '01'
status: planning
priority: high
created: '2026-04-20'
updated: '2026-04-20'
owner: 'Dejan Vasic'
prd: '01-league-table-crawler.md'
started: ''
completed: ''
estimated-hours: '8'
tags: [crawler, table, fixtures, dribl, playwright]
---

## Overview

Implements an internal league standings page for WSC team detail pages. Crawls the Dribl table API using the existing Playwright network-interception pattern, syncs to canonical JSON files, and renders a highlighted standings table at `/football/teams/{slug}/table`. Updates `TeamDetailNav` to link internally instead of externally.

## Phase 0 — API Analysis (agent-browser)

### Task 0.1 — Inspect real Dribl ladder API response

Before writing any code, use the `agent-browser` skill to capture the actual JSON shape:

1. Open the browser and navigate to a known team `tableUrl` from Sanity (e.g. the State League 2 Men's North-West team's Dribl ladder page)
2. Monitor network requests for calls to `mc-api.dribl.com/api/ladders`
3. Capture and print the full JSON response — record all field names, types, and nullable fields
4. Note any envelope fields (e.g. `meta`, `links`, pagination) beyond `data[]`
5. Document the real shape in a comment block at the top of `src/types/table.ts` before writing the Zod schema

**Findings — confirmed API shape:**

URL intercepted: `GET https://mc-api.dribl.com/api/ladders?date_range=default&season=nPmrj2rmow&competition=wOmejBq1N0&league=PmjBD66BmZ&ladder_type=regular&tenant=w8zdBWPmBX&require_pools=true`

Top-level response shape:
```json
{
  "data": [ /* array of ladder-entry objects */ ],
  "point_adjustments": null
}
```

Each `data` entry shape:
```json
{
  "type": "ladder-entry",
  "id": "pmvzbbREmv",
  "attributes": {
    "team_hash_id": "pmvzbYyEmv",       // string, never null
    "league_hash_id": "PmjBD66BmZ",     // string, never null
    "league_name": "State League 2 Men's - North-West", // string, never null
    "stage_order": null,                 // always null in this dataset
    "team_name": "Williamstown SC Seniors", // string, never null
    "season_name": "2026",              // string (year as string), never null
    "club_code": "WILC",                // string, never null
    "club_name": "Williamstown SC",     // string, never null
    "club_logo": "https://ocean.dribl.com/...", // string URL, never null
    "points": 9,                        // int
    "goals_for": 8,                     // int
    "goals_against": 5,                 // int
    "goal_difference": 3,               // int
    "played": 3,                        // int
    "won": 3,                           // int
    "drawn": 0,                         // int
    "lost": 0,                          // int
    "pen_win": 0,                       // int
    "pen_loss": 0,                      // int
    "et_win": 0,                        // int
    "et_loss": 0,                       // int
    "red_cards": 1,                     // int
    "yellow_cards": 8,                  // int
    "other_cards": 0,                   // int
    "temporary_dismissals": 0,          // int
    "seq_no": 12,                       // int
    "position": 1,                      // int
    "forfeits": 0,                      // int
    "points_per_game": "3.00",          // string (decimal as string)
    "byes": 0,                          // int
    "point_adjustment": 0,              // int
    "pool_name": null,                  // nullable string
    "upcoming_matches": [ /* array */ ],
    "recent_matches": [ /* array */ ]
  },
  "links": { /* ignored */ }
}
```

Key notes for Zod schema:
- Only `stage_order` and `pool_name` are nullable across all 12 entries
- `season_name` is a string `"2026"` — parse to int with `Number()`
- `points_per_game` is a decimal string — ignore in canonical type
- `upcoming_matches` and `recent_matches` arrays can be `z.any()` (not needed in canonical type)
- Team logo URL uses `https://ocean.dribl.com/` base (not `mc-api`)
- 12 teams in this league

**Verification:** Complete — Zod schema in Phase 1 is based on real observed data.

---

## Phase 1 — Types

### Task 1.1 — Create `src/types/table.ts`

Create new file with all Zod schemas and TypeScript types (field names confirmed from Phase 0):

1. Add `externalTableEntryAttributesSchema`:
   - `team_hash_id: z.string()` — used as canonical `teamId`
   - `team_name: z.string()`
   - `club_name: z.string()`
   - `club_logo: z.string()` — logo URL
   - `season_name: z.string()` — e.g. `"2026"`, parse to int for canonical type
   - `league_name: z.string()`
   - `position: z.number().int()`
   - `played: z.number().int()`
   - `won: z.number().int()`
   - `drawn: z.number().int()`
   - `lost: z.number().int()`
   - `goals_for: z.number().int()`
   - `goals_against: z.number().int()`
   - `goal_difference: z.number().int()`
   - `points: z.number().int()`
   - `stage_order: z.number().nullable()`
   - `pool_name: z.string().nullable()`
   - `upcoming_matches: z.array(z.any()).optional()`
   - `recent_matches: z.array(z.any()).optional()`
2. Add `externalTableEntrySchema = z.object({ type: z.literal('ladder-entry'), id: z.string(), attributes: externalTableEntryAttributesSchema })`
3. Add `externalTableApiResponseSchema = z.object({ data: z.array(externalTableEntrySchema), point_adjustments: z.any().nullable() })`
4. Export canonical types:
   - `TableEntry` — `{ teamId, teamName, clubName, logoUrl, position, played, wins, draws, losses, goalsFor, goalsAgainst, goalDifference, points }`
   - `TableData` — `{ season: number; competition: string; entries: TableEntry[] }`
5. Add `tableDataSchema` Zod schema for validating canonical output

**Verification:** `npm run type:check` passes. ✅

---

## Phase 2 — Sanity Query Extension

### Task 2.1 — Extend `getCrawlableTeams()` in `src/lib/content/teams.ts`

Current `crawlableTeamsQuery` (line 75) does not include `tableUrl`.

1. Update `CrawlableTeam` type to add `tableUrl?: string`
2. Add `tableUrl` to `crawlableTeamsQuery` GROQ projection
3. No other files need changing — `wsc.ts` already calls `getCrawlableTeams()`

**Verification:** TypeScript resolves `team.tableUrl` without errors. ✅

---

## Phase 3 — Crawl Command

### Task 3.1 — Create `bin/commands/crawlTable.ts`

Model after `bin/commands/crawlFixtures.ts` using the simpler single-response interception pattern:

1. Export `CrawlTableOptions = { team: string; tableUrl: string }`
2. Launch Chromium (`headless: false, channel: 'chrome'`), same user-agent/viewport as `crawlFixtures.ts`
3. Register `page.on('response', ...)` — capture responses where `url().includes('mc-api.dribl.com/api/ladders')` and `response.ok()`
4. Navigate to the `tableUrl` (the Dribl ladder page URL stored in Sanity); wait for network idle or first API response (60 s timeout)
5. Validate captured response with `externalTableApiResponseSchema`
6. Write to `data/external/table/{team-slug}.json` using `mkdirSync` + `writeFileSync`
7. Export `crawlTable` function; handle `ZodError` and generic errors with `logger`

### Task 3.2 — Register `crawl table` in `bin/wsc.ts`

1. Import `crawlTable` from `./commands/crawlTable`
2. Add command under `crawl` group:
   ```
   crawl table
     -t, --team <slug>
     -u, --table-url <url>
   ```
3. When no `--team` provided, iterate `getCrawlableTeams()`, skip teams where `tableUrl` is falsy
4. Collect failures; `process.exit(1)` if any

### Task 3.3 — Add npm scripts to `package.json`

```json
"crawl:table": "tsx bin/wsc.ts crawl table",
"crawl:table:ci": "xvfb-run --auto-servernum tsx bin/wsc.ts crawl table"
```

**Phase 3 verification:**
1. Run `npm run crawl:table -- --team <slug> --table-url <url>` for one real team
2. Confirm `data/external/table/{slug}.json` exists and contains valid JSON matching the shape captured in Phase 0
3. Run `npm run type:check` — no errors

✅ Verified: `data/external/table/state-league-2-men-s-north-west.json` written with 12 entries. WSC top of table (pos 1, 9 pts). Type check clean.

---

## Phase 4 — Sync Command

### Task 4.1 — Create `bin/commands/syncTable.ts`

Model after `bin/commands/syncFixtures.ts`:

1. Export `SyncTableOptions = { team: string }`
2. Read `data/external/table/{team}.json`, parse with `externalTableApiResponseSchema`
3. Transform each entry to `TableEntry` (map snake_case → camelCase)
4. Extract `season` (year from response meta if available, else current year) and `competition` string
5. Build `TableData` object; validate with `tableDataSchema`
6. Write to `data/table/{team}.json`

### Task 4.2 — Register `sync table` in `bin/wsc.ts`

1. Import `syncTable` from `./commands/syncTable`
2. Add command under `sync` group:
   ```
   sync table
     -t, --team <slug>
   ```
3. When no `--team`, iterate `getCrawlableTeams()`, skip teams where `tableUrl` is falsy
4. Collect failures; `process.exit(1)` if any

### Task 4.3 — Add npm scripts to `package.json`

```json
"sync:table": "tsx bin/wsc.ts sync table",
"sync:table:ci": "tsx bin/wsc.ts sync table"
```

**Phase 4 verification:**
1. Run `npm run sync:table -- --team <slug>` for the same team used in Phase 3
2. Confirm `data/table/{slug}.json` exists with correct canonical shape: `{ season, competition, entries: [...] }`
3. Spot-check: entry count matches external file, `position`/`points` fields are numbers, `teamName` is populated

---

## Phase 5 — Table Service

### Task 5.1 — Create `src/lib/matches/tableService.ts`

```ts
export async function getTableForTeam(slug: string): Promise<TableData | null>
```

- Uses `fs.readFile` from `data/table/{slug}.json`
- Validates with `tableDataSchema`; returns `null` on missing file
- Wrap in React `cache()` (same pattern as `matchService.ts:loadFixture`)

---

## Phase 6 — Table Page

### Task 6.1 — Create `src/app/(site)/football/teams/[slug]/table/page.tsx`

Server component matching the structure of `matches/page.tsx`:

1. Receive `params: Promise<{ slug: string }>`
2. Call `getTeamBySlug(slug)` and `getTableForTeam(slug)` in parallel
3. `notFound()` if team or table data is missing
4. Export `generateMetadata` — title: `{team.name} - League Table | {clubName}`
5. Render a responsive `<table>` with columns: Pos | Team (logo + name) | P | W | D | L | GF | GA | GD | Pts
6. Highlight the WSC row — compare entry `teamName` to a config value (use `getClubConfig()` from `@/lib/config` which exposes `wscClubName` or derive from existing config)
7. Use Next.js `<Image />` for team logos (16×16 or 20×20)
8. Light/dark theme via DaisyUI table classes; mobile-first (abbreviate column headers on small screens)

### Task 6.2 — Create `src/components/teams/LeagueTable.tsx`

Extract table rendering into a standalone component:

```ts
type LeagueTableProps = {
  entries: TableEntry[];
  highlightTeamName: string;
};
```

- Keep page thin; all rendering logic in this component

**Phase 6 verification (agent-browser):**
1. Start dev server (`npm run dev`)
2. Use `agent-browser` to navigate to `/football/teams/{slug}/table`
3. Confirm: table renders with all 10 columns, WSC row is visually highlighted, logos load
4. Resize to mobile viewport — confirm columns abbreviate and layout doesn't break
5. Toggle dark mode — confirm table is readable in both themes
6. Run `npm run build` — no build errors

---

## Phase 7 — Nav Update

### Task 7.1 — Update `src/components/teams/TeamDetailNav.tsx`

Current Table tab (line 70–75):

```ts
{
  label: 'Table',
  href: tableUrl ?? '',
  isExternal: isExternalUrl(tableUrl ?? ''),
  isVisible: !!tableUrl,
  matchFn: () => false
}
```

Change to:

```ts
{
  label: 'Table',
  href: `${basePath}/table`,
  isExternal: false,
  isVisible: !!tableUrl,
  matchFn: (p) => p.startsWith(`${basePath}/table`)
}
```

- The `tableUrl` prop continues to signal whether the tab is visible; the link destination becomes the internal route

---

## Phase 8 — E2E Test

### Task 8.1 — Add E2E test for table page

Create `e2e/table.spec.ts` (model after existing fixture E2E tests):

1. Navigate to `/football/teams/{slug}/table` for a team with known table data
2. Assert table renders with expected columns
3. Assert WSC row has highlight class
4. Assert "Table" nav tab is active and links internally

---

## Verification Checklist

- [ ] `npm run format`
- [ ] `npm run lint`
- [ ] `npm run type:check`
- [ ] `npm run build`
- [ ] `npm run test:e2e`

---

## Rollback Plan

- Delete `data/external/table/` and `data/table/` directories to remove crawled data
- Revert `TeamDetailNav.tsx` Table tab to external link behaviour
- Delete `src/app/(site)/football/teams/[slug]/table/` route
- Delete `src/lib/matches/tableService.ts`
- Remove `crawl:table*` and `sync:table*` scripts from `package.json`
- Remove `crawl table` / `sync table` commands from `bin/wsc.ts`
- Revert `CrawlableTeam` type and GROQ query in `src/lib/content/teams.ts`
