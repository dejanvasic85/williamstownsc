# Team Matchday League Picker — UX Design Spike

Issue: #816 (spike only, implementation is #817)

## Purpose

Design the Studio UX for a team to pick its Matchday `leagueId` (`lea_...`), a new field driving
the Matchday subscription + API reads. It does **not** replace `competitionName`/`leagueName` —
see [Migration contract](#migration-contract) — those keep driving the unrelated Dribl crawler.
Output of this spike is the field shape and interaction model so #817 can implement without
further design decisions.

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

## Migration contract

- **Consumers of `leagueId`** (both server-side, added in #817+): Matchday subscription creation
  (which league a team's data is scoped to) and Matchday API reads (fixtures/table shown on the
  team page). Nothing else reads it.
- **Consumers of `competitionName`/`leagueName`**: only the existing Dribl crawler
  (`pnpm run crawl:fixtures`), gated by `enableFixturesCrawler`. Nothing else reads them.
- **No precedence rule is needed** because the two field pairs feed disjoint pipelines — a team
  can have Dribl crawler fields, `leagueId`, both, or neither, and each pipeline only ever reads
  its own field(s). There is no case where "both are set and differ" causes divergent behavior,
  since neither consumer looks at the other's field.
- **Coexistence is indefinite, not a migration window.** Retiring `competitionName`/`leagueName`
  is a separate, unscheduled follow-up gated on turning off Dribl scraping entirely (a crawler
  decision), not on `leagueId` adoption (a Matchday decision). #817 should not attempt to
  reconcile or backfill one from the other.

## Decision: season/competition context

**Yes, show it, but folded into one composite label — no separate season/competition selectors.**

`league.name` alone is ambiguous across seasons (same competition/league name, new id each year).
Since the API only returns `competitionId`/`seasonId` (opaque ids, not names), the label needs
`GET /competitions/{id}` and `GET /seasons/{id}` resolved and joined in, to build a label like:

```text
North-West Reserves — State League 2 Men's (2026)
```

This is a single searchable select field (typeahead over the composite label), not a cascading
season → competition → league picker — the club filter already narrows the list to something a
human can scan, and cascading selects add clicks without adding clarity.

**All of this resolution happens server-side, not in the browser** — see
[Server boundary](#server-boundary) below. The Studio input calls one internal endpoint and gets
back an already-joined `{ leagueId, label }[]` list; it never talks to the Matchday API directly.

### Server boundary

Sanity Studio (`/studio`) is a client-side React app — a custom input component running there
cannot hold `MATCHDAY_API_TOKEN` or be trusted to pass through an arbitrary `clubId`. #817 needs a
small internal route (e.g. `src/app/api/studio/leagues/route.ts`) that:

- runs server-side and calls `getMatchdayClient()` (existing `src/lib/matchday/matchdayClient.ts`),
  so `MATCHDAY_API_TOKEN` never reaches the browser;
- reads `clubId` itself from `getSiteSettings()` (`siteSettings.matchday.clubId`) — it takes no
  `clubId` input from the request, so an author can't point the picker at another club's data;
  the response payload also carries no other club's data since the club is server-chosen;
- does the `/leagues` → `/competitions/{id}` → `/seasons/{id}` joins server-side (see
  [Metadata lookup failures](#metadata-lookup-failures)) and returns one flat, pre-labelled list.

This route is _not_ automatically gated by Sanity's own Studio login — a Next.js route handler is
reachable by anyone who finds the URL, unlike Studio itself. The data it serves (this club's
league/competition/season names) isn't sensitive — it's the same shape of data already public on
fixtures/table pages — so the residual risk is Matchday API quota/cost from unauthenticated
polling, not data leakage or cross-club access. #817 should decide whether that residual risk
needs a lightweight guard (e.g. checking the Sanity Studio session, or simple rate limiting) or is
acceptable as-is; either way the token and clubId derivation stay server-side regardless.

### Metadata lookup failures

The route joins three calls (`/leagues`, then `/competitions/{id}` and `/seasons/{id}` per
distinct id in the list). Each can fail independently:

- **`GET /leagues` fails or times out**: the whole route returns an error; the Studio input shows
  "Couldn't load leagues — try again" with a manual retry button (no auto-retry loop).
- **`GET /leagues` succeeds but a `/competitions/{id}` or `/seasons/{id}` lookup fails for one
  league**: don't drop that league or fail the whole request — fall back to its raw id fragment
  in the label, e.g. `North-West Reserves — cmp_V1St… (2026)`, and log the failed lookup
  server-side. One bad lookup shouldn't hide an otherwise-pickable league.
- **Loading state**: the Studio input shows a skeleton/spinner in the dropdown until the route
  responds; the rest of the document form stays interactive (this field alone is pending).
- **Retry**: manual only, triggered by the author re-opening the field or clicking "retry" — no
  background polling. Competition/season names change rarely enough that the route doesn't need
  its own cache layer for this spike; revisit if the join proves slow in practice.
- **Empty list** (`GET /leagues` returns `[]`): treated the same as the field's existing
  zero-league empty state (see [Field design](#field-design)), not an error.

## Field design

- New field on `team.ts`: `matchday.leagueId` (string, `lea_...`, object fieldset named `matchday`,
  same shape as `matchday.clubId` on `siteSettings.ts`) — but **optional, not `Rule.required()`**.
  Matchday rollout is staged per team (mirrors how `competitionName`/`leagueName` are already only
  required conditionally, when `enableFixturesCrawler` is on) — most teams won't have a `leagueId`
  on day one, and a team with zero matching leagues in the club's list must still be saveable.
  Field presence is itself the "this team is on Matchday" signal — no separate enable flag.
  Validation when a value _is_ present:
  `Rule.custom((value) => !value || /^lea_/.test(value) || 'Must be a Matchday league id (lea_...)')`.
- Custom Studio input component (`components.input`) — Sanity's built-in `string`/`reference`
  inputs don't support the server-joined list from [Server boundary](#server-boundary), so #817
  needs a small React input that: fetches the internal leagues route, renders a searchable list,
  and stores only the `leagueId` string on the document (no denormalized label persisted — it's
  resolved fresh each time the field renders, same as any other join).
- **Stale-selection handling**: the document's saved `leagueId` can be absent from the current
  list — club change, league removed upstream, or the metadata route having a transient gap. The
  input must not silently clear or swap it. On load, if the saved id isn't in the fetched list,
  render it as its own row ("Saved league not found — `lea_V1StGXR8Z5`") above the search results,
  with an explicit "Clear" action. The field only changes on deliberate author action — never as a
  side effect of a list that failed to include the previously-saved value.
- Existing `competitionName`/`leagueName` free-text fields stay as-is for now (crawler still reads
  them) — this spike does not touch them. See [Migration contract](#migration-contract).

## Mock

```text
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
- Empty state: club has zero leagues (`GET /leagues` returns `[]`) — show inline text ("No leagues
  found for this club yet") without blocking the rest of the document form (the field stays
  optional and saveable, see [Field design](#field-design)).
- Loading, error, and stale-selection states: see
  [Metadata lookup failures](#metadata-lookup-failures) and the stale-selection bullet in
  [Field design](#field-design).

## Todo

Design spike (#816) — done:

- [x] Sketch the Studio UX for a club-scoped, searchable League field
- [x] Decide season/competition context is needed, folded into one composite label
- [x] Define the migration contract against `competitionName`/`leagueName`
- [x] Define the server boundary for the Matchday token and `clubId`
- [x] Define loading/error/stale-selection states

Implementation (#817) — not started:

- [ ] Add optional `matchday.leagueId` field to `team.ts` (see [Field design](#field-design))
- [ ] Add `src/app/api/studio/leagues/route.ts` server route (see [Server boundary](#server-boundary))
- [ ] Build the custom Studio input component (search, loading/error/stale-selection states)
- [ ] Run `pnpm run type:gen` after the schema change

## Unresolved questions

- Do we ever need to represent "no matching league yet" (team plays in a league that Matchday
  hasn't crawled)? Out of scope until a team hits it in practice.
