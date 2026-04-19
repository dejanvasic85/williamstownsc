---
title: 'League Table Crawler'
status: accepted
priority: unset
source: internal
captured: '2026-04-19'
domain: engineering
prd: '01-league-table-crawler.md'
tags: [crawler, table, fixtures, dribl]
---

## Problem / Opportunity

The site shows fixtures and results but no league standings table. Users want to know where their team sits in the competition without leaving the site.

## Context

The fixture pipeline (`bin/commands/crawlFixtures.ts`) uses Playwright to intercept Dribl API responses at `https://mc-api.dribl.com/api/`. The team schema (`src/sanity/schema/team.ts`) already has a `tableUrl` field (external link only) and `leagueName`/`competitionName` crawler fields. Canonical match data lives in `data/matches/{team-slug}.json`.

Two approaches were on the table:

1. **Crawl approach** — intercept the Dribl table API endpoint during a browser crawl (similar to fixtures), validate with Zod, and write a static `data/table/{team-slug}.json` file alongside the match data.
2. **Calculate approach** — derive standings from existing `data/matches/{team-slug}.json` results (wins/draws/losses/GD/points) and recompute whenever fixtures sync runs.

The crawl approach was chosen — it gives accurate real Dribl standings (tiebreaker logic, head-to-head, etc.) with no calculation risk.

## Rough Scope

Add `crawl:table` and `sync:table` commands in `bin/wsc.ts`, new `crawlTable.ts` and `syncTable.ts` commands, Zod schema for external table API response, new types in `src/types/table.ts`, `tableService.ts`, and an internal `/table` page per team.

## Success Signal

Table visible on each team's page as an internal route, matching the standings shown on the Dribl website.

## Open Questions

- How often should the table be refreshed — same cadence as fixtures CI job?
