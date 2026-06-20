---
name: dribl-crawling
description: Document patterns for crawling dribl.com fixtures website using playwright-core with direct API calls (Cloudflare bypass via browser context) to extract clubs and fixtures data. Covers ID resolution, round-based extraction, and transformation phases.
---

# Dribl Crawling

## Overview

Extract clubs and fixtures data from `https://fv.dribl.com/fixtures/` (Cloudflare-protected SPA) using a real browser for Cloudflare clearance, then making direct API calls via `page.evaluate(fetch(...))` rather than driving the SPA UI.

**Purpose**: Crawl dribl.com to maintain up-to-date clubs and fixtures.

## Why direct API — not SPA scraping

The SPA's default date-window views (Results tab + Fixtures upcoming) create a dead zone of 4+ rounds whenever a team is regraded to a new league mid-season. The dribl API accepts a `round` param; iterating `round=1..N` is deterministic and never drops rounds.

Raw `curl` returns HTTP 403 (Cloudflare). The browser context has clearance cookies — `page.evaluate(fetch(...))` uses them transparently.

## Architecture

**Data flow:**

```
dribl list endpoints  →  data/external/dribl-ids.json  (ID cache, gitignored)
dribl API (per round) →  data/external/fixtures/{team}/chunk-N.json  (raw, gitignored)
dribl API (ladders)   →  data/external/table/{team}.json  (raw, gitignored)
transform             →  data/matches/{team}.json  (committed)
transform             →  data/table/{team}.json  (committed)
```

**Two-phase pattern:**

1. **Extraction**: Browser establishes Cloudflare clearance; direct API calls via `page.evaluate(fetch(...))`; saves raw JSON per round
2. **Transformation**: Read chunk files, validate with Zod, transform, deduplicate, save

**Key technologies:**

- playwright-core (real Chrome browser — only for Cloudflare clearance)
- `page.evaluate(fetch(...))` — makes authenticated API calls from browser context
- Zod validation schemas
- TypeScript with tsx runner

## ID Resolver

**Reference**: `bin/commands/driblIdResolver.ts`

The dribl API uses hashed IDs (e.g. `season=nPmrj2rmow`) not human names. IDs are resolved once from list endpoints and cached to `data/external/dribl-ids.json` keyed by `leagueName`. On regrade, the team's Sanity `leagueName` changes — the resolver finds no cache entry, re-resolves, and caches.

**List endpoints (all require `tenant` param):**

| What | Endpoint | Notes |
|---|---|---|
| Tenant ID | `api/tenants?mc_link=fv.dribl.com&slug=fv` | Returns single object `data.id` |
| Season ID | `api/list/seasons?disable_paging=true&tenant=…` | Match on `name` = "2026" |
| Competition ID | `api/list/competitions?disable_paging=true&tenant=…` | Match on `name` (full name from Sanity `competitionName`) |
| League ID | `api/list/leagues?disable_paging=true&tenant=…&competition=…` | Match on `name`; skip `(Removed)` prefix entries |

**Tenant note:** `api/tenants` returns `data` as a single object (not array). All other list endpoints return `data` as an array.

**Cache file shape** (`data/external/dribl-ids.json`):

```json
{
  "tenant": "w8zdBWPmBX",
  "leagues": {
    "Girls' West 12B": {
      "season": "nPmrj2rmow",
      "competition": "Bjma0p6VdR",
      "league": "lNba4aGomx",
      "tenant": "w8zdBWPmBX"
    }
  }
}
```

**Pattern:**

```typescript
export async function resolveLeagueIds(
  page: Page,
  leagueName: string,
  competitionName: string,
  seasonYear: string
): Promise<DriblLeagueIds> {
  const cache = loadCache();
  if (cache.leagues[leagueName]) return cache.leagues[leagueName]; // cache hit

  const tenant = cache.tenant || (await resolveTenant(page));
  const season = await resolveSeasonId(page, tenant, seasonYear);
  const competition = await resolveCompetitionId(page, tenant, competitionName);
  const league = await resolveLeagueId(page, tenant, competition, leagueName);

  const ids = { season, competition, league, tenant };
  cache.tenant = tenant;
  cache.leagues[leagueName] = ids;
  saveCache(cache);
  return ids;
}
```

## Clubs Extraction

**Reference**: `bin/commands/crawlClubs.ts`

Clubs still use SPA response interception (one-off list, not per-round). Pattern unchanged.

**Pattern:**

```typescript
const browser = await chromium.launch({ headless: false, channel: 'chrome' });
const context = await browser.newContext({ userAgent: '...', viewport: { width: 1280, height: 720 } });
const [clubsResponse] = await Promise.all([
  page.waitForResponse((r) => r.url().startsWith(clubsApiUrl) && r.ok(), { timeout: 60_000 }),
  page.goto(url, { waitUntil: 'domcontentloaded' })
]);
const rawData = await clubsResponse.json();
const validated = externalApiResponseSchema.parse(rawData);
writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n');
```

**API endpoint:** `https://mc-api.dribl.com/api/list/clubs?disable_paging=true`

**Output:** `data/external/clubs/clubs.json`

## Fixtures Extraction

**Reference**: `bin/commands/crawlFixtures.ts`

**Single browser session for all teams.** One `page.goto()` at startup establishes Cloudflare clearance. Each team's rounds are fetched via `page.evaluate(fetch(...))` — no SPA navigation per team.

**Core helper:**

```typescript
async function browserFetch(page: Page, url: string): Promise<unknown> {
  const raw = await page.evaluate(async (u: string) => {
    const r = await fetch(u, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${u}`);
    return r.text();
  }, url);
  return JSON.parse(raw as string);
}
```

**Round URL builder:**

```typescript
function buildApiUrl(endpoint: string, ids: LeagueIds, extra?: Record<string, string>): string {
  const params = new URLSearchParams({
    season: ids.season,
    competition: ids.competition,
    league: ids.league,
    tenant: ids.tenant,
    timezone: 'Australia/Melbourne',
    ...extra
  });
  return `https://mc-api.dribl.com/api/${endpoint}?${params.toString()}`;
}
```

**Round loop pattern:**

```typescript
async function crawlTeamByRounds(page, team, ids, outputDir) {
  clearChunkFiles(outputDir); // wipe stale chunks first

  let chunkIndex = 0;
  let emptyStreak = 0;
  const maxConsecutiveEmptyRounds = 2;
  const maxRounds = 40;

  for (let round = 1; round <= maxRounds; round++) {
    const url = buildApiUrl('fixtures', ids, { round: String(round) });
    const json = await browserFetch(page, url);
    const validated = externalFixturesApiResponseSchema.parse(json);

    if (validated.data.length === 0) {
      emptyStreak++;
      if (emptyStreak >= maxConsecutiveEmptyRounds) break;
      continue;
    }

    emptyStreak = 0;
    writeFileSync(`${outputDir}/chunk-${chunkIndex}.json`, JSON.stringify(validated, null, '\t') + '\n');
    chunkIndex++;
  }
}
```

**Why clear chunks:** the old crawl wrote to both `fixtures/` and `results/` dirs. New crawl writes everything to `fixtures/` only. `clearChunkFiles` removes stale round data so sync doesn't merge old chunks.

**Full crawlFixtures flow:**

```typescript
export async function crawlFixtures(teams) {
  browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const page = await (await browser.newContext({ userAgent: '...' })).newPage();

  // ONE goto — establishes Cloudflare clearance for all subsequent fetch() calls
  await page.goto('https://fv.dribl.com/fixtures/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  for (const team of teams) {
    const ids = await resolveLeagueIds(page, team.league, team.competition, team.season);

    clearChunkFiles(`data/external/results/${team.team}`); // clear old results dir
    await crawlTeamByRounds(page, team.team, ids, `data/external/fixtures/${team.team}`);
    await crawlTeamTable(page, team.team, ids, `data/external/table`);
  }
}
```

**API endpoints:**

| Endpoint | Params | Response |
|---|---|---|
| `api/fixtures` | season, competition, league, round, tenant, timezone | `{ data: fixture[], links, meta }` |
| `api/ladders` | season, competition, league, tenant, timezone | `{ data: ladderEntry[] }` |

**Output:**

- Path: `data/external/fixtures/{team}/chunk-0.json`, `chunk-1.json`, … (one file per non-empty round)
- Format: same `externalFixturesApiResponseSchema` shape

**CLI args:**

- `-t, --team <slug>` — repeatable; filters Sanity teams to these slugs
- `-l, --league <name>` — manual mode only; requires exactly one `-t`
- `-s, --season <year>` (optional, default to current year)
- `-c, --competition <name>` — full competition name (e.g. "Junior Girls Sunday (U12 - U18)")

**CLI usage examples:**

```bash
# All Sanity teams
pnpm run crawl:fixtures

# Specific team
pnpm run crawl:fixtures -- -t under-12-girls

# Manual mode: single team with explicit league
pnpm run crawl:fixtures -- -t my-team -l "Girls' West 12B"
```

## Table (Ladder) Extraction

Table crawling is embedded in `crawlFixtures`. After round crawl, calls `api/ladders` directly with the same IDs. No SPA navigation needed.

**Pattern:**

```typescript
async function crawlTeamTable(page, team, ids, outputDir) {
  const url = buildApiUrl('ladders', ids);
  const json = await browserFetch(page, url);
  const validated = externalTableApiResponseSchema.parse(json);
  if (validated.data.length === 0) return; // no ladder (MiniRoos etc.)
  writeFileSync(`${outputDir}/${team}.json`, JSON.stringify(validated, null, '\t') + '\n');
}
```

**API endpoint:** `https://mc-api.dribl.com/api/ladders`

**Output:** `data/external/table/{team}.json` (single file per team)

## Fixtures Transformation

**Reference**: `bin/commands/syncFixtures.ts`

Reads `data/external/fixtures/{team}/chunk-*.json` and `data/external/results/{team}/chunk-*.json` (both optional). Results dir will typically be empty after new crawl — dedup handles any overlap.

**Pattern:**

```typescript
// Read chunks, validate
const responses = await readExternalFixtureFiles(dir, required=false);

// Transform + merge results-first (so completed scores win dedup)
const { fixtures, competition, season } = mergeFixtures([...resultResponses, ...fixtureResponses]);

// Deduplicate by round + homeTeamId + awayTeamId
const unique = deduplicateFixtures(fixtures);

// Sort by round then date, write
writeFileSync(outputPath, JSON.stringify({ competition, season, totalFixtures, totalRounds, fixtures: sorted }, null, '\t'));
```

**Transform service**: `src/lib/matches/fixtureTransformService.ts`

**Output:** `data/matches/{team}.json`

## Validation Schemas

**Reference**: `src/types/matches.ts`, `src/types/table.ts`

- `externalFixturesApiResponseSchema` — API response `{ data: fixture[], links?, meta? }`
- `externalTableApiResponseSchema` — ladder response `{ data: ladderEntry[] }`
- `fixtureSchema` / `fixtureDataSchema` — internal transformed shape

**Always validate at boundaries** (API response → external schema, transform output → internal schema).

## CI Integration

**Reference**: `.github/workflows/crawl.yml`

```yaml
- name: Install Chrome
  run: npx playwright install --with-deps chrome

- name: Crawl fixtures
  run: npm run crawl:fixtures:ci
```

- `crawl:fixtures:ci` = `xvfb-run --auto-servernum tsx bin/wsc.ts crawl fixtures` (Linux needs xvfb)
- Single browser session crawls all Sanity teams in one run
- `dribl-ids.json` cache is rebuilt each CI run (not committed)

## Best Practices

**Cloudflare clearance:**

- One `page.goto()` per browser session is enough — clearance persists for all `fetch()` calls
- Wait 3s after goto before starting API calls
- Keep the same page alive; don't close and reopen between teams

**Empty round handling:**

- Stop after `maxConsecutiveEmptyRounds=2` consecutive empty rounds
- Some comps have scheduling gaps mid-season — single empty round is not the end
- `maxRounds=40` is a hard safety cap

**Chunk file management:**

- Always `clearChunkFiles(outputDir)` before writing new chunks for a team
- Also clear the old `results/` dir so stale chunks don't pollute sync
- One chunk file per non-empty round (not per "Load more" page like old approach)

**ID cache:**

- Re-resolve any `leagueName` not in cache — handles regrades automatically
- Tenant ID is stable; only re-fetch if cache is empty
- `(Removed)` prefix in league name = old/regraded league; skip it

**Logging:**

- Use pino logger with child loggers per module
- Log round count per team, ID resolution events, and per-team completion

**Error handling:**

- Per-team failures are caught and collected; session continues to the next team
- Single throw at the end signals partial failure to the caller
- Browser closes in `finally` block regardless of failures

**File operations:**

- `mkdirSync(path, { recursive: true })` before writing
- Format JSON with tabs: `JSON.stringify(data, null, '\t') + '\n'`
- Absolute paths via `resolve(currentDir, '../../...')`

## Common Patterns

**Single-browser session:**

```typescript
let browser: Browser | undefined;
const failures: string[] = [];
try {
  browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const page = await (await browser.newContext({ userAgent: '...' })).newPage();
  await page.goto(siteUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  for (const team of teams) {
    try {
      // direct API calls via browserFetch(page, url)
    } catch (error) {
      failures.push(team.slug);
    }
  }
} finally {
  if (browser) await browser.close();
}
if (failures.length > 0) throw new Error(`Failed: ${failures.join(', ')}`);
```

**Reading chunks (sync side):**

```typescript
const files = await fs.readdir(dir);
const chunks = files
  .filter((f) => f.match(/^chunk-\d+\.json$/))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
    return numA - numB;
  });
```

**Deduplication:**

```typescript
const seen = new Set<string>();
const unique = items.filter((item) => {
  const key = computeKey(item);
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
```
