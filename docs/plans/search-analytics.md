# Search Analytics Events Plan

## Purpose

Capture search analytics via GTM to understand user search behavior: what users search for, result effectiveness, and click-through patterns.

## Requirements

- Track search queries with keywords and result count
- Track result clicks with position index and result metadata
- Use existing GTM integration (`sendGTMEvent` from `@next/third-parties/google`)
- Follow GA4 recommended event naming conventions
- Only fire events in production (respect `isLocal()` check)

## Events to Implement

### 1. `search` Event
Fires when search results are returned (debounced query completes).

| Parameter | Type | Description |
|-----------|------|-------------|
| search_term | string | User's search query |
| result_count | number | Total results returned |

### 2. `select_content` Event
Fires when user clicks a search result.

| Parameter | Type | Description |
|-----------|------|-------------|
| content_type | string | Result type: news/team/program/page |
| item_id | string | Result slug or ID |
| search_term | string | Original search query |
| index | number | 0-based position in results |

## Architecture

```
src/lib/analytics/
└── searchEvents.ts    # Analytics event functions
```

Create a dedicated analytics module that:
- Wraps `sendGTMEvent` with type-safe event helpers
- Checks `isLocal()` to prevent dev events
- Exports: `trackSearch()`, `trackSearchResultClick()`

## Todo

- [ ] Create `src/lib/analytics/searchEvents.ts` with event functions
- [ ] Update `SearchResults.tsx` to track result clicks with index
- [ ] Update `useSearch.ts` or `SearchModal.tsx` to track search queries
- [ ] Test events in GTM preview mode
- [ ] Document dataLayer schema for GTM setup

## Unresolved Questions

1. Should we track searches with 0 results separately (e.g., `search_no_results` event)?
2. Debounce threshold for search event - fire on every debounced query or only after user pauses (e.g., 1s)?
3. Should we track modal open/close as engagement events?
