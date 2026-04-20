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

## Phase 1 — Types

### Task 1.1 — Create `src/types/table.ts`

Create new file with all Zod schemas and TypeScript types:

1. Add `externalTableEntrySchema` with fields: `position`, `team_name`, `team_logo`, `played`, `wins`, `draws`, `losses`, `goals_for`, `goals_against`, `goal_difference`, `points`, `team_id`
2. Add `externalTableApiResponseSchema` wrapping `data: z.array(externalTableEntrySchema)`
3. Export canonical types:
   - `TableEntry` — camelCase, typed fields per PRD
   - `TableData` — `{ season: number; competition: string; entries: TableEntry[] }`
4. Add `tableDataSchema` Zod schema for validating canonical output

**Verification:** `npm run type:check` passes.

---

## Phase 2 — Sanity Query Extension

### Task 2.1 — Extend `getCrawlableTeams()` in `src/lib/content/teams.ts`

Current `crawlableTeamsQuery` (line 75) does not include `tableUrl`.

1. Update `CrawlableTeam` type to add `tableUrl?: string`
2. Add `tableUrl` to `crawlableTeamsQuery` GROQ projection
3. No other files need changing — `wsc.ts` already calls `getCrawlableTeams()`

**Verification:** TypeScript resolves `team.tableUrl` without errors.

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
