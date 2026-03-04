---
name: wsc-fixture-pipeline
description: End-to-end workflow for running and verifying the WSC fixture pipeline — crawling fixtures/results from Dribl and syncing to local JSON files. Use this skill when asked to crawl, sync, or verify fixtures for Williamstown SC teams, run the fixture pipeline, or validate fixture output data.
---

# WSC Fixture Pipeline

## Purpose

Run and verify the two-stage CLI pipeline that keeps WSC fixture data up to date:

1. **Crawl** — Playwright scrapes `fv.dribl.com` and saves raw JSON chunks
2. **Sync** — Transforms and merges raw chunks into validated `data/matches/{team}.json`

## CLI Commands

```bash
# Stage 1: Crawl fixtures + results from Dribl
npm run crawl:fixtures -- -t "<team-slug>" -l "<league-name>" -s <year> -c "<competition>"

# Stage 2: Merge and validate to data/matches/
npm run sync:fixtures -- -t "<team-slug>"
```

### Args for crawl:fixtures

| Flag                     | Required | Default      | Description                          |
| ------------------------ | -------- | ------------ | ------------------------------------ |
| `-t, --team <slug>`      | ✅       | —            | Team slug for output folder          |
| `-l, --league <slug>`    | ✅       | —            | League name shown in Dribl filter    |
| `-s, --season <year>`    | optional | current year | Season year                          |
| `-c, --competition <id>` | optional | `FFV`        | Competition ID shown in Dribl filter |

### Required args for sync:fixtures

| Flag            | Description                                    | Example        |
| --------------- | ---------------------------------------------- | -------------- |
| `-t` / `--team` | Team slug — must match the crawl output folder | `seniors-mens` |

## WSC Team Slugs and League Names

Known WSC teams (slugs match `data/matches/` filenames):

| Team                    | Slug                                       | `-l` League (3rd filter)                      | `-c` Competition (2nd filter)      |
| ----------------------- | ------------------------------------------ | --------------------------------------------- | ---------------------------------- |
| Seniors Men             | `seniors-mens`                             | `NPL VIC Men`                                 | `Senol NPL Victoria Men`           |
| Reserves Men            | `reserves-mens`                            | Varies                                        | Varies        |
| State League North-West | `state-league-2-men-s-north-west`          | `VETO Sports State League Men's - North West` | `FFV`         |
| State League Reserves   | `state-league-2-men-s-north-west-reserves` | Varies                                        | `FFV`         |

To find the exact league/competition name: navigate to `https://fv.dribl.com/fixtures/`, apply the filters manually, and copy the exact text from the dropdown.

## Output File Structure

```
data/external/fixtures/{team}/   ← raw upcoming fixture chunks (gitignored)
  chunk-0.json
  chunk-1.json
  ...

data/external/results/{team}/    ← raw results chunks (gitignored)
  chunk-0.json
  ...

data/matches/{team}.json         ← final merged output (committed)
```

### data/matches/{team}.json schema

```json
{
	"competition": "string",
	"season": 2026,
	"totalFixtures": 132,
	"totalRounds": 22,
	"fixtures": [
		{
			"round": 1,
			"date": "2026-03-20",
			"day": "Friday",
			"time": "20:30",
			"homeTeamId": "bam1nQWrNw",
			"awayTeamId": "7MNGgM7NAz",
			"address": "Partridge Street Reserve Pitch 2",
			"coordinates": "-37.663361,145.023019",
			"homeScore": 2,
			"awayScore": 1
		}
	]
}
```

Score fields (`homeScore`, `awayScore`) are only present on past matches.

## Validation Checklist

After running the full pipeline, verify `data/matches/{team}.json`:

- [ ] Rounds are sequential (R1, R2, R3 — no gaps)
- [ ] `totalFixtures` equals `fixtures.length`
- [ ] `totalRounds` equals the highest `round` value
- [ ] Past matches have `homeScore` and `awayScore` populated
- [ ] Upcoming matches have no score fields (or `undefined`)
- [ ] No duplicate fixtures (same round + homeTeamId + awayTeamId)
- [ ] `data/external/fixtures/{team}/` has chunk files
- [ ] `data/external/results/{team}/` has chunk files (if season has started)

## Using a Test Team

When WSC doesn't have results yet (e.g. early season), use a test team to verify the pipeline end-to-end without committing data:

```bash
# Example: Green Gully Seniors (NPL) — externalId: OVdz1bpKGr in data/clubs/clubs.json
npm run crawl:fixtures -- -t "green-gully-seniors" -l "NPL VIC Men" -c "Senol NPL Victoria Men"
npm run sync:fixtures -- -t "green-gully-seniors"
```

After verifying: **do not commit** `data/external/fixtures/green-gully-seniors/`, `data/external/results/green-gully-seniors/`, or `data/matches/green-gully-seniors.json`.

## Dribl Filter Navigation

The crawl applies three filters on the Dribl SPA in this order:

1. **Season** — selects the year (default: current year)
2. **Competition** — selects the competition type (e.g. `NPL VIC Men`, `FFV`)
3. **League** — selects specific league (required, must match exactly)

If filter selection fails, the crawl throws an error with the failed filter name. Double-check the exact text in the Dribl UI.

## Deduplication Logic

The sync merges results and fixtures with results taking priority:

1. Results chunks are loaded first
2. Fixtures chunks are loaded second
3. Deduplication key: `round-homeTeamId-awayTeamId`
4. First occurrence wins — results win over upcoming fixtures

This ensures past matches always have scores even if they appear in both datasets.

## Common Errors

| Error                             | Cause                                    | Fix                                          |
| --------------------------------- | ---------------------------------------- | -------------------------------------------- |
| `Failed to select league "..."`   | League name doesn't match Dribl dropdown | Navigate to fv.dribl.com, check exact label  |
| `No external fixture files found` | crawl:fixtures not run first             | Run crawl before sync                        |
| `Executable doesn't exist`        | Chrome not installed                     | `npx playwright install --with-deps chrome`  |
| Zod validation error              | API response structure changed           | Check `src/types/matches.ts` schemas         |
| `Team directory not found`        | Wrong team slug passed to sync           | Ensure slug matches crawl output folder name |

## Key Source Files

| File                                         | Purpose                                                         |
| -------------------------------------------- | --------------------------------------------------------------- |
| `bin/commands/crawlFixtures.ts`              | Playwright browser automation, filter application, chunk saving |
| `bin/commands/syncFixtures.ts`               | Reads chunks, transforms, deduplicates, writes output           |
| `src/lib/matches/fixtureTransformService.ts` | Transforms raw API fixture → internal `Fixture` type            |
| `src/types/matches.ts`                       | Zod validation schemas for all fixture/club types               |
| `data/clubs/clubs.json`                      | Club registry used for team ID resolution                       |
