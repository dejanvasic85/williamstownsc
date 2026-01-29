# Extract Clubs Data via Playwright

## Purpose

Automate club data extraction from the Dribl API using Playwright browser automation. The API has CORS restrictions preventing direct fetch, so a headless browser navigates to the fixtures page and intercepts the clubs API network response.

## Requirements

- Single CLI command that extracts, validates, transforms, and saves club data
- Reuse existing Zod schemas and transform logic
- No code duplication between `syncClubs.ts` and new extraction script
- Optional `--url` override for different seasons
- Backward compat: `sync:clubs` continues to work independently

## Inputs

- `--url` e.g. Given the URL as an input:
https://fv.dribl.com/fixtures/?date_range=default&season=nPmrj2rmow&timezone=Australia%2FMelbourne. The specific api call we need to observe and get a response is https://mc-api.dribl.com/api/list/clubs?disable_paging=true

## Todo

- [ ] Extract shared sync functions into `src/lib/clubSyncService.ts`
- [ ] Refactor `bin/syncClubs.ts` to use shared service
- [ ] Create `bin/extractClubs.ts` (Playwright extraction + sync pipeline)
- [ ] Add `extract:clubs` npm script
- [ ] Lint, format, type:check

## Files

| File | Action |
|------|--------|
| `src/lib/clubSyncService.ts` | Create - shared load/merge/save functions |
| `bin/syncClubs.ts` | Refactor - import from shared service |
| `bin/extractClubs.ts` | Create - Playwright extraction script |
| `package.json` | Add `extract:clubs` script |
