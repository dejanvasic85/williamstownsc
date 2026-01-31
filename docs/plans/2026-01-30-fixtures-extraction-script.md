# Fixtures Extraction Script Implementation

**Created:** 2026-01-30

## Purpose

Implement `bin/crawlFixtures.ts` to extract fixtures data from dribl.com (SPA with Cloudflare) using Playwright, handling pagination and saving as chunk files.

## Status

✅ **Completed** - 2026-01-30

## Requirements

- Extract fixtures data from dribl.com using browser automation
- Handle Cloudflare protection with proper user agent
- Support CLI arguments for league, season, and competition filtering
- Navigate modal-based filters that intercept standard Playwright clicks
- Collect paginated API responses via persistent listener
- Validate data with Zod schema
- Save validated chunks to `data/external/fixtures/{team}/chunk-*.json`

## Implementation Summary

### Problem

Modal overlay intercepts Playwright's standard click actions, preventing filter selection.

### Solution

Use `page.evaluate()` to directly manipulate DOM, bypassing actionability checks.

### Key Files Modified

- `bin/crawlFixtures.ts` - Main implementation of the fixtures crawler
  - Added `clickFilterByText()` and related helpers using `page.evaluate()` to interact with modal filters despite overlay/animation issues
  - Integrated CLI args, pagination loop, response listener, Zod validation, and chunked file writing into the crawler entrypoint
- `package.json` - Scripts already present:
  - `crawl:fixtures`: Normal execution
  - `crawl:fixtures:ci`: CI execution with xvfb-run

### Testing

```bash
# Test help message
npm run crawl:fixtures

# Test with example data
npm run crawl:fixtures -- --competition "VETO Sports State League Men's" --season 2026 --league "State League 2 Men's - North-West"

# Verify output
ls -la data/external/fixtures/{team}/chunk-*.json
```

## Todo

- [x] Implement CLI argument parsing
- [x] Set up browser with Cloudflare bypass
- [x] Implement persistent response listener
- [x] Fix filter selection with `page.evaluate()`
- [x] Implement pagination loop
- [x] Add Zod validation
- [x] Save chunks to files
- [x] Add error handling
- [x] Add npm scripts
- [x] Test and verify

## Notes

- The key insight was using `page.evaluate()` instead of standard Playwright locators because the modal overlay blocks normal click events
- Wait times of 1500-2000ms are required for modal animations
- Filter options require exact text matching
- URL changes after each filter selection trigger new API calls
