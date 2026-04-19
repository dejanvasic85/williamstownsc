---
title: 'League Ladder Crawler'
status: accepted
priority: unset
source: internal
captured: '2026-04-19'
domain: engineering
prd: '01-league-ladder-crawler.md'
tags: [crawler, ladder, fixtures, dribl]
---

## Problem / Opportunity

The site shows fixtures and results but no league ladder/standings table. Users want to know where their team sits in the competition without leaving the site.

## Context

The fixture pipeline (`bin/commands/crawlFixtures.ts`) uses Playwright to intercept Dribl API responses at `https://mc-api.dribl.com/api/`. The team schema (`src/sanity/schema/team.ts`) already has a `tableUrl` field (external link only) and `leagueName`/`competitionName` crawler fields. Canonical match data lives in `data/matches/{team-slug}.json`.

Two approaches are on the table:

1. **Crawl approach** — intercept the Dribl ladder API endpoint during a browser crawl (similar to fixtures), validate with Zod, and write a static `data/ladder/{team-slug}.json` file alongside the match data.
2. **Calculate approach** — derive standings from existing `data/matches/{team-slug}.json` results (wins/draws/losses/GD/points) and recompute whenever fixtures sync runs.

The crawl approach gives accurate real Dribl standings (tiebreaker logic, head-to-head, etc.) with no calculation risk. The calculate approach avoids a new crawl dependency but may diverge from official standings if Dribl uses non-obvious tiebreakers.

## Rough Scope

- **Crawl path**: add `crawl:ladder` command in `bin/wsc.ts`, new `crawlLadder.ts` command, Zod schema for external ladder API response, `syncLadder.ts` to merge/write canonical file, new types in `src/types/ladder.ts`, display component.
- **Calculate path**: add a `calculateLadder()` transformer in `src/lib/matches/`, run post-sync, write to `data/ladder/{team-slug}.json`. Simpler but less trustworthy.

## Success Signal

Ladder table visible on each team's fixture page, matching the standings shown on the Dribl website.

## Open Questions

- Does the Dribl API expose a ladder/standings endpoint that can be intercepted? (Likely yes — same mc-api.dribl.com pattern as fixtures.)
- What tiebreaker rules does Football Victoria use? If complex, the crawl approach is safer.
- Should the ladder be stored in Sanity or as a static JSON file? Static JSON is consistent with existing fixtures pattern.
- How often should the ladder be refreshed — same cadence as fixtures CI job?
