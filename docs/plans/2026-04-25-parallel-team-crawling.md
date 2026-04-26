# Parallel Team Crawling via GitHub Actions Matrix (Chunked)

## Purpose

The fixture crawl runs sequentially across all teams in a single browser session on GitHub Actions. As team count grows, this has already forced a timeout increase from 15→45 minutes (`ac6061e`). The goal is to split teams into parallel chunks so total runtime scales by chunk count, not team count.

## Why Not Lambda?

Lambda was considered but rejected:

- Playwright requires a full Chromium binary (~300MB) — exceeds Lambda's 250MB unzipped package limit without custom container images (ECR, etc.)
- No existing Lambda/IaC infrastructure in this project (GitHub Actions + Vercel + Sanity only)
- Lambda's 15-minute max timeout is also a hard constraint; GH Actions runners allow up to 6 hours

## Why Chunked, Not One-Job-Per-Team?

A naive per-team matrix (1 runner per team) would:

- Download Chromium 13+ times (~300MB each = 4GB+ bandwidth per run)
- Run `npm ci` 13 times
- Spin up 13 separate runners with cold-start overhead

**Chunked matrix** (e.g. 4 teams per job → 4 runners) gives ~4x speedup while keeping overhead proportional. The chunk size is configurable via a workflow input so it can be tuned without code changes.

## Architecture: Chunked GitHub Actions Matrix

Split into three jobs:

1. **`setup`** — fetches crawlable team slugs from Sanity, computes chunks of N teams, outputs a JSON array of chunk arrays
2. **`crawl`** — matrix job on chunks; each runner installs Chrome once, then iterates its assigned teams sequentially, uploads per-team artifacts
3. **`commit`** — downloads all artifacts, formats, creates the PR

Key properties:

- `fail-fast: false` — one flaky chunk doesn't cancel others
- Chunk size configurable (default: 4 teams/job, tunable via `workflow_dispatch` input)
- Per-chunk timeout ~20 minutes (4 teams × ~5 min each)
- Club crawl remains a separate non-matrix job (global, not per-team)

## Current State (What Exists)

The CLI already supports single-team flags — no code changes needed for the crawl/sync commands:

```
tsx bin/wsc.ts crawl fixtures --team <slug>    # Already works (wsc.ts:36-93)
tsx bin/wsc.ts sync fixtures --team <slug>     # Already works (wsc.ts:106-109)
tsx bin/wsc.ts sync table --team <slug>        # Already works (wsc.ts:141-144)
```

Multiple `--team` flags can be passed to `crawl fixtures` in one call (wsc.ts:32-34):

```
tsx bin/wsc.ts crawl fixtures --team team-a --team team-b --team team-c --team team-d
```

Missing: a command to **list crawlable team slugs as chunks** (JSON array of arrays) for the matrix `setup` job.

## Requirements

- [x] Add `wsc list teams` subcommand to `bin/wsc.ts` — prints slugs as JSON array (flat, for reference)
- [x] Add `wsc list chunks --size <n>` subcommand — prints `[["team-a","team-b","team-c","team-d"],["team-e",...],...]` for use as GH Actions matrix
- [x] Rewrite `.github/workflows/crawl.yml` with 3-job chunked matrix strategy
- [x] Artifacts scoped per chunk (or per team within chunk) — avoid collisions in commit job
- [x] `crawl:clubs:ci` stays as its own sequential step (unchanged logic)

## Files to Modify

| File                          | Change                                                 |
| ----------------------------- | ------------------------------------------------------ |
| `bin/wsc.ts`                  | Add `list` → `teams` and `list` → `chunks` subcommands |
| `.github/workflows/crawl.yml` | Rewrite to 3-job chunked matrix strategy               |

## `list` Commands (Reference Implementation)

Add to `bin/wsc.ts` after the existing `sync` commands:

```typescript
const list = program.command('list').description('List configuration data');

list
	.command('teams')
	.description('List crawlable team slugs from Sanity')
	.option('--json', 'Output as JSON array')
	.action(async (options: { json?: boolean }) => {
		const teams = await getCrawlableTeams();
		if (options.json) {
			process.stdout.write(JSON.stringify(teams.map((t) => t.slug)));
		} else {
			teams.forEach((t) => log.info({ slug: t.slug }, t.slug));
		}
	});

list
	.command('chunks')
	.description('List crawlable team slugs grouped into chunks (for CI matrix)')
	.option('-s, --size <n>', 'Teams per chunk', '4')
	.action(async (options: { size: string }) => {
		const chunkSize = parseInt(options.size, 10);
		const teams = await getCrawlableTeams();
		const slugs = teams.map((t) => t.slug);
		const chunks: string[][] = [];
		for (let i = 0; i < slugs.length; i += chunkSize) {
			chunks.push(slugs.slice(i, i + chunkSize));
		}
		process.stdout.write(JSON.stringify(chunks));
	});
```

## Proposed Workflow YAML (Reference)

```yaml
name: Crawl Data

permissions:
  contents: write
  pull-requests: write

on:
  workflow_dispatch:
    inputs:
      chunk_size:
        description: 'Teams per crawl job'
        default: '4'
        required: false
  schedule:
    - cron: '0 12 * * 1-5' # Weekdays 10pm AEST
    - cron: '0 8-13 * * 6,0' # Weekends 6pm–11pm AEST (hourly)

env:
  NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ vars.SANITY_PROJECT_ID }}
  NEXT_PUBLIC_SANITY_DATASET: ${{ vars.SANITY_DATASET }}
  LOG_LEVEL: info

jobs:
  setup:
    name: Compute team chunks
    runs-on: ubuntu-latest
    outputs:
      chunks: ${{ steps.chunk.outputs.chunks }}
    steps:
      - uses: actions/checkout@v4
      - uses: jdx/mise-action@v4
      - run: npm ci
      - id: chunk
        run: |
          SIZE=${{ github.event.inputs.chunk_size || '4' }}
          echo "chunks=$(tsx bin/wsc.ts list chunks --size $SIZE)" >> $GITHUB_OUTPUT

  crawl-clubs:
    name: Crawl clubs
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: jdx/mise-action@v4
      - run: npm ci
      - run: npx playwright install --with-deps chrome
      - run: npm run crawl:clubs:ci
      - run: npm run sync:clubs
      - uses: actions/upload-artifact@v4
        with:
          name: clubs-data
          path: |
            data/external/clubs/
            data/clubs/

  crawl:
    name: Crawl chunk ${{ strategy.job-index }}
    needs: setup
    runs-on: ubuntu-latest
    timeout-minutes: 25
    strategy:
      matrix:
        chunk: ${{ fromJson(needs.setup.outputs.chunks) }}
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: jdx/mise-action@v4
      - run: npm ci
      - run: npx playwright install --with-deps chrome

      - name: Crawl fixtures for chunk
        # Pass all teams in this chunk as repeated --team flags
        run: |
          TEAM_ARGS=$(echo '${{ toJson(matrix.chunk) }}' | jq -r '.[] | "--team " + .' | tr '\n' ' ')
          xvfb-run --auto-servernum tsx bin/wsc.ts crawl fixtures $TEAM_ARGS

      - name: Sync fixtures and tables for chunk
        run: |
          for team in $(echo '${{ toJson(matrix.chunk) }}' | jq -r '.[]'); do
            tsx bin/wsc.ts sync fixtures --team "$team"
            tsx bin/wsc.ts sync table --team "$team"
          done

      - uses: actions/upload-artifact@v4
        with:
          name: chunk-${{ strategy.job-index }}
          path: |
            data/external/fixtures/
            data/external/results/
            data/external/table/
            data/matches/
            data/table/

  commit:
    name: Create PR
    needs: [crawl-clubs, crawl]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: jdx/mise-action@v4
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          path: artifact-staging/
          merge-multiple: true
      - name: Merge artifacts into data/
        run: cp -r artifact-staging/. data/
      - run: npm run format
      - uses: peter-evans/create-pull-request@v8
        id: cpr
        with:
          branch: feat/update-clubs-and-fixtures
          title: 'feat: update clubs and fixtures data'
          body: Automated PR to update clubs and fixtures data.
          commit-message: 'feat: update clubs and fixtures data'
          labels: content
          token: ${{ secrets.ACTIONS_TOKEN }}
      - name: Enable auto-merge
        if: steps.cpr.outputs.pull-request-operation == 'created'
        run: gh pr merge --auto --squash ${{ steps.cpr.outputs.pull-request-number }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Scalability

| Teams      | Chunk size    | Runners | Chrome downloads | Est. runtime |
| ---------- | ------------- | ------- | ---------------- | ------------ |
| 13 (today) | 4             | 4       | 4                | ~10 min      |
| 20         | 4             | 5       | 5                | ~10 min      |
| 40         | 4             | 10      | 10               | ~10 min      |
| 13         | 13 (no chunk) | 13      | 13               | ~5 min       |

Chunk size 4 is a good default — roughly 4x speedup, reasonable runner count.

## Verification

1. `tsx bin/wsc.ts list chunks --size 4` — prints `[["team-a","team-b","team-c","team-d"],["team-e",...]]`
2. Run single chunk locally: `tsx bin/wsc.ts crawl fixtures --team seniors-mens --team reserves-mens`
3. Push workflow to a branch, trigger `workflow_dispatch` with `chunk_size=4` — confirm parallel matrix jobs in GH Actions UI
4. Confirm `commit` job collects all data files and raises PR with correct content

## Open Questions

- Does Dribl rate-limit parallel requests from multiple IPs? Low risk since GH runners have different IPs, but worth monitoring on first run.
- Artifact path overlap between chunks (e.g. both upload `data/external/fixtures/` root) — `merge-multiple: true` on download should handle this, but needs testing to confirm no files are silently dropped.
- Should `crawl:clubs:ci` run in parallel with `crawl` matrix, or after? Currently proposed as parallel (independent of team chunks) — fine since clubs data is separate.
