# Team Matchday League Picker — UX Design Spike

Issue: #816 (spike only, implementation is #817)

## Purpose

Design the Studio UX for a team to pick its Matchday `leagueId` (`lea_...`), replacing the
current free-text `competitionName`/`leagueName` crawler filters as the source of truth for the
subscription + API reads. Output of this spike is the field shape and interaction model so #817
can implement without further design decisions.

## Requirements / constraints

- Club is fixed per site: `siteSettings.matchday.clubId` (`clb_...`, shipped in #815). The picker
  never asks the author to type or choose a club.
- Source data: `GET /leagues?clubId=clb_...` (SDK 0.2.0). Response is
  `{ id, name, competitionId, seasonId, createdAt, updatedAt }[]` — **no embedded competition or
  season name**, just their ids (`apps/api/src/schemas/leagueSchema.ts` in the matchday repo).
- `league.name` is scoped to a competition (e.g. "North-West Reserves") and is **not** unique
  across seasons — the Dribl crawler's `leagueIdResolver.ts` keys its cache by league name per
  season/competition pair, confirming the same name recurs year to year with a different id.
- A club's league count is small (current crawler covers a handful of WSC teams), so client-side
  search over a single fetched list is enough — no need for server-side typeahead/pagination.

## Decision: season/competition context

**Yes, show it, but folded into one composite label — no separate season/competition selectors.**

`league.name` alone is ambiguous across seasons (same competition/league name, new id each year).
Since the API only returns `competitionId`/`seasonId` (opaque ids, not names), the Studio input
must resolve `GET /competitions/{id}` and `GET /seasons/{id}` for the leagues in the club's list
(or use list endpoints and join client-side) to build a label like:

```
North-West Reserves — State League 2 Men's (2026)
```

This is a single searchable select field (typeahead over the composite label), not a cascading
season → competition → league picker — the club filter already narrows the list to something a
human can scan, and cascading selects add clicks without adding clarity.

## Field design

- New field on `team.ts`: `matchday.leagueId` (string, `lea_...`, mirrors the `matchday.clubId`
  pattern already on `siteSettings.ts` — object fieldset named `matchday`, `Rule.required().regex(/^lea_/)`).
- Custom Studio input component (`components.input`) — Sanity's built-in `string`/`reference`
  inputs don't support fetching+joining three external endpoints, so #817 needs a small React
  input that: fetches `GET /leagues?clubId=...`, resolves competition/season names, renders a
  searchable list, and stores only the `leagueId` string on the document (no denormalized label
  persisted — it's resolved fresh each time the field renders, same as any other join).
- Existing `competitionName`/`leagueName` free-text fields stay as-is for now (crawler still reads
  them) — this spike does not touch them. Deprecating them is a separate follow-up once the
  crawler itself moves off Dribl scraping, not in scope for #817.

## Mock

```
┌─ Matchday ──────────────────────────────────────────────┐
│ League                                                   │
│ ┌───────────────────────────────────────────────────┐   │
│ │ 🔍 Search leagues…                                 │   │
│ ├───────────────────────────────────────────────────┤   │
│ │ North-West Reserves — State League 2 Men's (2026)  │   │
│ │ North-West Reserves — State League 2 Men's (2025)  │   │
│ │ State League 1 Women's (2026)                      │   │
│ │ Reserves Division 3 (2026)                          │   │
│ └───────────────────────────────────────────────────┘   │
│                                                            │
│ Selected: North-West Reserves — State League 2 Men's     │
│ (2026)                                              [✕]  │
│ lea_V1StGXR8Z5                                            │
└────────────────────────────────────────────────────────┘
```

- Selected state shows the composite label as a chip with a clear (✕) affordance, plus the raw
  `leagueId` in small muted text underneath — useful when cross-checking against the matchday CLI
  or support tickets, not for the author's day-to-day use.
- Empty/error states: if the club has zero leagues (API returns `[]`) or the request fails, show
  inline text ("No leagues found for this club yet" / "Couldn't load leagues — try again") rather
  than blocking the rest of the document form.

## Unresolved questions

- Should selecting a league also require `enableFixturesCrawler`-style opt-in flag, or is picking
  a league itself the "this team is on matchday" signal? Leaning toward the latter (field presence
  = enabled) but leaving to #817 since it's an implementation detail, not UX.
- Do we ever need to represent "no matching league yet" (team plays in a league matchday hasn't
  crawled)? Out of scope until a team hits it in practice.
