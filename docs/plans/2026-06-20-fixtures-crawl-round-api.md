# Fixtures crawl: round-based direct API

## Purpose

Stop the fixtures crawl silently dropping mid-season rounds (gap rounds get
wiped from `data/matches/*.json`). Replace fragile SPA-default-view scraping
with deterministic round-by-round direct API fetches.

## Root cause (proven)

Crawler relies on SPA's two default views only:

- Results tab (past): up to last completed round (U12G: R1–R7, ≤2026-06-14)
- Fixtures tab (`date_range=default`): one ~30-row window weeks out (R12–R18, ≥2026-07-26)
- Gap = R8–R11 (2026-06-15→07-25) never requested → dropped on sync.

Triggered by regrades/league resets (new fixture dates straddle the gap). Hit
~42 teams in commit 9ebde95 (#667), 16,727 deletions.

Verified directly vs `mc-api.dribl.com/api/fixtures` (via browser; raw curl = 403 Cloudflare):

- `date_range=default` returns the missing R8–R12 window, but SPA Fixtures tab lands on R12+.
- Each query returns ONE ≤30-row window then an empty page; cursor `next` does
  not walk the season. No single `date_range` spans the season.
- **`round=<n>` param works**: `round=8` returns exactly R8 incl. tomorrow's game.

## Approach

Keep playwright browser (Cloudflare clearance) but stop driving the SPA UI.
From inside the browser context, `fetch()` the API directly with our params.

### Phase 1 — Hybrid ID resolver (derive once, cache on disk)

List endpoints (all need `tenant`):

- tenant: `api/tenants?mc_link=fv.dribl.com&slug=fv` → tenant id `w8zdBWPmBX`
- seasons: `api/list/seasons?disable_paging=true&tenant=…` → name "2026" → id
- competitions: `api/list/competitions?disable_paging=true&tenant=…` → name → id
- leagues: `api/list/leagues?disable_paging=true&tenant=…&competition=<id>` → name → id

Cache file: `data/external/dribl-ids.json`, e.g.

```json
{
	"tenant": "w8zdBWPmBX",
	"leagues": {
		"Girls' West 12B": {
			"season": "nPmrj2rmow",
			"competition": "Bjma0p6VdR",
			"league": "lNba4aGomx"
		}
	}
}
```

- Key by Sanity `leagueName`. Resolve season/competition/league from list endpoints.
- Re-resolve when a leagueName is missing from cache (regrade → new name → fresh lookup).
- Skip "(Removed) …" leagues; exact-match on live name.

### Phase 2 — Round-based fetch

Per team: loop `round=1,2,3,…`, stop after N consecutive empty rounds (e.g. 2).
Each round → one API response. Save as chunk files (same external schema, no
sync change). Replaces fixtures + results SPA crawl. Past rounds carry scores
already (status=complete), so single source covers both.

Ladder crawl: keep existing `crawlTeamTable` (already direct-ish via response listener) OR move to `api/ladders` direct fetch with same ids.

## Requirements

- No change to `syncFixtures.ts` (chunk shape identical).
- `externalFixturesApiResponseSchema` already matches round-fetch responses.
- Keep per-team failure isolation + single browser session.
- Manual mode (`-l league`) still supported; resolve that league name too.
- Dedup key unchanged (`round-home-away`).
- CI (`crawl:fixtures:ci`, xvfb) unaffected.

## Todo

- [ ] driblIdResolver service: tenant + list endpoints → ids, with on-disk cache
- [ ] driblApiClient service: in-browser `fetch` helper (Cloudflare-cleared page)
- [ ] Rewrite `crawlFixtures` to loop rounds via API instead of SPA filters
- [ ] Remove SPA filter-clicking code (applyFilters, clickFilterByText, Load more) once round-loop replaces it
- [ ] Verify U12G yields all 18 rounds incl. R8 tomorrow
- [ ] Re-crawl + sync all teams to restore wiped fixtures
- [ ] Run full check suite (format/lint/type/build/e2e) before push

## Unresolved questions

- Empty-round stop threshold: 2 consecutive? Some comps have byes/gaps mid-season — may need "stop after 3 empty AND past known max round" or a hard cap (e.g. 40).
- Ladder: keep SPA-tab approach or switch to direct `api/ladders`? (lower risk to keep for now)
- Should `dribl-ids.json` be committed or gitignored like other `data/external`? (lean: gitignored, regenerated)
