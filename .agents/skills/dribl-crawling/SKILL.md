---
name: dribl-crawling
description: Document patterns for crawling dribl.com fixtures website using playwright-core to extract clubs and fixtures data with Cloudflare protection. Covers extraction (crawling with API interception) and transformation (Zod validation, data merging) phases.
---

# Dribl Crawling

## Overview

Extract clubs and fixtures data from https://fv.dribl.com/fixtures/ (SPA with Cloudflare protection) using real browser automation with playwright-core. Two-phase workflow: extraction (raw API data) → transformation (validated, merged data).

**Purpose**: Crawl dribl.com to maintain up-to-date clubs and fixtures.

## Architecture

**Data flow:**

```
dribl API → data/external/fixtures/{team}/ (raw) → transform → data/matches/ (validated)
dribl API → data/external/clubs/ (raw) → transform → data/clubs/ (validated)
```

**Two-phase pattern:**

1. **Extraction**: Playwright intercepts API requests, saves raw JSON
2. **Transformation**: Read raw data, validate with Zod, transform, deduplicate, save

**Key technologies:**

- playwright-core (real Chrome browser)
- Zod validation schemas
- TypeScript with tsx runner

## Clubs Extraction

**Reference**: `bin/commands/crawlClubs.ts`

**Pattern:**

```typescript
// Launch browser
const browser = await chromium.launch({
	headless: false,
	channel: 'chrome'
});

// Custom user agent (bypass detection)
const context = await browser.newContext({
	userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
	viewport: { width: 1280, height: 720 }
});

// Intercept API request
const [clubsResponse] = await Promise.all([
	page.waitForResponse((response) => response.url().startsWith(clubsApiUrl) && response.ok(), {
		timeout: 60_000
	}),
	page.goto(url, { waitUntil: 'domcontentloaded' })
]);

// Validate and save
const rawData = await clubsResponse.json();
const validated = externalApiResponseSchema.parse(rawData);
writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n');
```

**API endpoint:**

- URL: `https://mc-api.dribl.com/api/list/clubs?disable_paging=true`
- Response: JSON with `data` array of club objects
- Validation: `externalApiResponseSchema` (src/types/matches.ts)

**Output:**

- Path: `data/external/clubs/clubs.json`
- Format: Single JSON file with all clubs

**CLI args:**

- `--url <fixtures-page-url>` (optional, defaults to standard fixtures page)

## Fixtures Extraction

**Reference**: `bin/commands/crawlFixtures.ts`

**Single browser session for all teams.** The browser launches once, then each team's pages are crawled by reusing the same page instance. Each `page.goto()` resets the SPA's filter state, so `applyFilters` is idempotent on every navigation.

**Pattern:**

```typescript
export async function crawlFixtures(teams: CrawlFixturesTeamOptions[]): Promise<void> {
	let browser: Browser | undefined;
	const failures: string[] = [];

	try {
		browser = await chromium.launch({ headless: false, channel: 'chrome' });
		const context = await browser.newContext({
			userAgent: '...',
			viewport: { width: 1280, height: 720 }
		});
		const page = await context.newPage();

		const responses: Response[] = [];
		page.on('response', async (response) => {
			if (response.url().startsWith(driblApiBaseUrl) && response.ok()) {
				responses.push(response);
			}
		});

		for (const team of teams) {
			try {
				const filterArgs = {
					league: team.league,
					season: team.season,
					competition: team.competition
				};

				// Crawl fixtures (upcoming)
				responses.length = 0;
				await crawlPage({
					page,
					responses,
					url: fixturesBaseUrl,
					outputDir: `.../${team.team}`,
					filterArgs
				});

				// Crawl results (past + scores)
				responses.length = 0;
				await crawlPage({
					page,
					responses,
					url: resultsBaseUrl,
					outputDir: `.../${team.team}`,
					filterArgs
				});

				responses.length = 0;
			} catch (error) {
				failures.push(team.team);
			}
		}
	} finally {
		if (browser) await browser.close();
	}

	if (failures.length > 0) {
		throw new Error(`Crawl failed for teams: ${failures.join(', ')}`);
	}
}
```

**Steps per team:**

1. Reset `responses.length = 0`
2. Navigate to `https://fv.dribl.com/fixtures/` — SPA loads with default filters
3. Apply filters: Season → Competition → League (via `clickFilterByText`)
4. Paginate via "Load more..." button until exhausted
5. Save each API response chunk as `chunk-{index}.json`
6. Reset responses and repeat for `https://fv.dribl.com/results/`

**API endpoint:**

- URL: `https://mc-api.dribl.com/api/fixtures`
- Query params: season, competition, league (from filters)
- Response: JSON with `data` array, `links` (next/prev), `meta` (cursors)
- Validation: `externalFixturesApiResponseSchema`

**Output:**

- Path: `data/external/fixtures/{team}/chunk-0.json`, `chunk-1.json`, etc.
- Path: `data/external/results/{team}/chunk-0.json`, `chunk-1.json`, etc.
- Format: Multiple JSON files (one per "Load more" click)

**CLI args:**

- `-t, --team <slug>` — repeatable; filters Sanity teams to these slugs (e.g., `-t slug1 -t slug2`)
- `-l, --league <name>` — manual mode only; requires exactly one `-t`
- `-s, --season <year>` (optional, default to current year)
- `-c, --competition <id>` (optional, default to FFV)

**CLI usage examples:**

```bash
# All Sanity teams (single browser session)
npm run crawl:fixtures

# Specific teams from Sanity (single browser session)
npm run crawl:fixtures -- -t state-league-2-men-s-north-west -t reserves

# Manual mode: single team with explicit league
npm run crawl:fixtures -- -t my-team -l "State League 2 Men's - North-West"
```

## Table Extraction

**Reference**: `bin/commands/crawlTable.ts`

**Single browser session for all teams.** Each team has its own Dribl ladder URL. The browser navigates to each URL in turn and captures the single API response using `page.waitForResponse()` (same pattern as `crawlClubs.ts`).

**Pattern:**

```typescript
export async function crawlTable(teams: CrawlTableTeamOptions[]): Promise<void> {
	let browser: Browser | undefined;
	const failures: string[] = [];

	try {
		browser = await chromium.launch({ headless: false, channel: 'chrome' });
		const context = await browser.newContext({
			userAgent: '...',
			viewport: { width: 1280, height: 720 }
		});
		const page = await context.newPage();

		for (const team of teams) {
			try {
				const [response] = await Promise.all([
					page.waitForResponse((r) => r.url().includes('mc-api.dribl.com/api/ladders') && r.ok(), {
						timeout: 60_000
					}),
					page.goto(team.tableUrl, { waitUntil: 'domcontentloaded' })
				]);

				const rawData = await response.json();
				const validated = externalTableApiResponseSchema.parse(rawData);
				// save to data/external/table/{team}.json
			} catch (error) {
				failures.push(team.team);
			}
		}
	} finally {
		if (browser) await browser.close();
	}

	if (failures.length > 0) {
		throw new Error(`Crawl failed for teams: ${failures.join(', ')}`);
	}
}
```

**API endpoint:**

- URL: `https://mc-api.dribl.com/api/ladders`
- Response: JSON with `data` array of ladder entries
- Validation: `externalTableApiResponseSchema` (src/types/table.ts)

**Output:**

- Path: `data/external/table/{team}.json`
- Format: Single JSON file per team

**CLI args:**

- `-t, --team <slug>` — repeatable; filters Sanity teams to these slugs
- `-u, --table-url <url>` — manual mode only; requires exactly one `-t`

## Clubs Transformation

**Reference**: `bin/commands/syncClubs.ts`

**Pattern:**

```typescript
// Load external data
const externalResponse = loadExternalData(); // from data/external/clubs/
const validated = externalApiResponseSchema.parse(externalResponse);

// Transform to internal format
const apiClubs = externalResponse.data.map((externalClub) => transformExternalClub(externalClub));

// Load existing clubs
const existingFile = loadExistingClubs(); // from data/clubs/

// Merge (deduplicate by externalId)
const clubsMap = new Map<string, Club>();
for (const club of existingClubs) {
	clubsMap.set(club.externalId, club);
}
for (const apiClub of apiClubs) {
	clubsMap.set(apiClub.externalId, apiClub); // update or add
}

// Sort by name
const mergedClubs = Array.from(clubsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

// Save
writeFileSync(CLUBS_FILE_PATH, JSON.stringify({ clubs: mergedClubs }, null, '\t'));
```

**Transform service**: `src/lib/clubService.ts`

- `transformExternalClub()`: Converts external club format to internal format
- Maps fields: id→externalId, attributes.name→name/displayName, etc.
- Normalizes address (combines address_line_1 + address_line_2)
- Maps socials array (name→platform, value→url)
- Validates output with `clubSchema`

**Output:**

- Path: `data/clubs/clubs.json`
- Format: `{ clubs: Club[] }`

## Fixtures Transformation

**Reference**: `bin/commands/syncFixtures.ts`

**Pattern:**

```typescript
// Read all chunk files
const teamDir = path.join(EXTERNAL_DIR, team);
const files = await fs.readdir(teamDir);
const chunkFiles = files.filter((f) => f.match(/^chunk-\d+\.json$/)).sort(); // natural number sort

// Load and validate each chunk
const responses: ExternalFixturesApiResponse[] = [];
for (const file of chunkFiles) {
	const content = await fs.readFile(path.join(teamDir, file), 'utf-8');
	const validated = externalFixturesApiResponseSchema.parse(JSON.parse(content));
	responses.push(validated);
}

// Transform all fixtures
const allFixtures = [];
for (const response of responses) {
	for (const externalFixture of response.data) {
		const fixture = transformExternalFixture(externalFixture);
		allFixtures.push(fixture);
	}
}

// Deduplicate (by round + homeTeamId + awayTeamId)
const seen = new Set<string>();
const deduplicated = allFixtures.filter((f) => {
	const key = `${f.round}-${f.homeTeamId}-${f.awayTeamId}`;
	if (seen.has(key)) return false;
	seen.add(key);
	return true;
});

// Sort by round, then date
const sorted = deduplicated.sort((a, b) => {
	if (a.round !== b.round) return a.round - b.round;
	return a.date.localeCompare(b.date);
});

// Calculate metadata
const totalRounds = Math.max(...sorted.map((f) => f.round), 0);

// Save
const fixtureData = {
	competition: 'FFV',
	season: 2025,
	totalFixtures: sorted.length,
	totalRounds,
	fixtures: sorted
};
writeFileSync(outputPath, JSON.stringify(fixtureData, null, '\t'));
```

**Transform service**: `src/lib/matches/fixtureTransformService.ts`

- `transformExternalFixture()`: Converts external fixture format to internal format
- Parses round number (e.g., "R1" → 1)
- Formats date/time/day strings (ISO date, 24h time, weekday name)
- Combines ground + field names for address
- Finds club external IDs by matching team names/logos
- Validates output with `fixtureSchema`

**Output:**

- Path: `data/matches/{team}.json`
- Format: `{ competition, season, totalFixtures, totalRounds, fixtures: Fixture[] }`

**CLI args:**

- `--team <slug>` (required) - Team slug to sync (e.g., "state-league-2-men-s-north-west")

## Validation Schemas

**Reference**: `src/types/matches.ts`

**External schemas (API responses):**

- `externalApiResponseSchema`: Clubs API response
- `externalClubSchema`: Single club object
- `externalFixturesApiResponseSchema`: Fixtures API response
- `externalFixtureSchema`: Single fixture object

**Internal schemas (transformed data):**

- `clubSchema`: Single club
- `clubsSchema`: Clubs file (`{ clubs: Club[] }`)
- `fixtureSchema`: Single fixture
- `fixtureDataSchema`: Fixtures file (`{ competition, season, totalFixtures, totalRounds, fixtures }`)

**Pattern**: Always validate at boundaries (API → external schema, transform → internal schema)

## CI Integration

**Reference**: `.github/workflows/crawl.yml`

**Linux setup (GitHub Actions):**

```yaml
- name: Install Chrome
  run: npx playwright install --with-deps chrome

- name: Crawl fixtures
  run: npm run crawl:fixtures:ci
```

**Key points:**

- Use `xvfb-run --auto-servernum` prefix on Linux for headless Chrome (e.g., `xvfb-run --auto-servernum tsx bin/wsc.ts crawl fixtures`)
- Install with `--with-deps` flag to get system dependencies
- No team args needed in CI — all Sanity teams are crawled in one browser session

**Package.json scripts pattern:**

```json
{
	"crawl:fixtures": "tsx bin/wsc.ts crawl fixtures",
	"crawl:fixtures:ci": "xvfb-run --auto-servernum tsx bin/wsc.ts crawl fixtures",
	"crawl:table": "tsx bin/wsc.ts crawl table",
	"crawl:table:ci": "xvfb-run --auto-servernum tsx bin/wsc.ts crawl table",
	"sync:clubs": "tsx bin/wsc.ts sync clubs",
	"sync:fixtures": "tsx bin/wsc.ts sync fixtures"
}
```

## Best Practices

**Logging:**

- Use pino logger with child loggers per module
- Log counts and progress for large operations

**Error handling:**

- Per-team failures are caught and collected — the session continues to the next team
- A single throw at the end signals partial failure to the caller
- Browser closes in `finally` block regardless of failures
- Special handling for ZodError (print issues) and missing Playwright executable

**File operations:**

- Always use `mkdirSync(path, { recursive: true })` before writing
- Format JSON with tabs: `JSON.stringify(data, null, '\t')`
- Add newline at end of file: `content + '\n'`
- Use absolute paths with `resolve(currentDir, '../relative/path')`

**Data separation:**

- Keep raw external data in `data/external/` (gitignored)
- Keep transformed data in `data/` (committed)
- Never commit external API responses directly

**Validation:**

- Validate immediately after receiving API data
- Validate before writing transformed data
- Use descriptive error messages with file paths

**CLI arguments:**

- Use Commander library for consistent CLI parsing
- `-t, --team` is repeatable (collector function): `-t slug1 -t slug2`
- Manual mode requires exactly one `-t` plus the URL/league option
- Sanity mode (no manual options) fetches team config from CMS

## Common Patterns

**Reading chunks:**

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

**Merge with existing:**

```typescript
const map = new Map<string, T>();
existing.forEach((item) => map.set(item.id, item));
incoming.forEach((item) => map.set(item.id, item)); // update or add
const merged = Array.from(map.values());
```

**Single-browser session pattern:**

```typescript
let browser: Browser | undefined;
const failures: string[] = [];
try {
	browser = await chromium.launch(...);
	const page = await (await browser.newContext(...)).newPage();
	for (const team of teams) {
		try {
			// work per team
		} catch (error) {
			failures.push(team.slug);
		}
	}
} finally {
	if (browser) await browser.close();
}
if (failures.length > 0) throw new Error(`Failed: ${failures.join(', ')}`);
```
