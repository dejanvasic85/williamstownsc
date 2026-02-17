# Search Analytics Events Plan

**Created:** 2026-01-26
**Status:** ✅ Complete

## Purpose

Capture search analytics via GTM to understand user search behavior: what users search for, result effectiveness, and click-through patterns.

## Requirements

- Track search queries with keywords and result count
- Track 0-result searches separately
- Track result clicks with position index and result metadata
- Track modal open/close as engagement events
- Use existing GTM integration (`sendGTMEvent` from `@next/third-parties/google`)
- Follow GA4 recommended event naming conventions
- Only fire events in production (respect `isLocal()` check)

## Events to Implement

### 1. `search` Event

Fires when search returns results (debounced query completes).

| Parameter    | Type   | Description            |
| ------------ | ------ | ---------------------- |
| search_term  | string | User's search query    |
| result_count | number | Total results returned |

### 2. `search_no_results` Event

Fires when search returns 0 results.

| Parameter   | Type   | Description         |
| ----------- | ------ | ------------------- |
| search_term | string | User's search query |

### 3. `select_content` Event

Fires when user clicks a search result.

| Parameter    | Type   | Description                         |
| ------------ | ------ | ----------------------------------- |
| content_type | string | Result type: news/team/program/page |
| item_id      | string | Result slug or ID                   |
| search_term  | string | Original search query               |
| index        | number | 0-based position in results         |

### 4. `search_modal_open` Event

Fires when search modal is opened.

### 5. `search_modal_close` Event

Fires when search modal is closed.

## Architecture

```text
src/lib/analytics/
└── searchEvents.ts    # Analytics event functions
```

Module exports:

- `trackSearch({ searchTerm, resultCount })` - fires `search` or `search_no_results`
- `trackSearchResultClick({ searchTerm, index, contentType, itemId })` - fires `select_content`
- `trackSearchModalOpen()` - fires `search_modal_open`
- `trackSearchModalClose()` - fires `search_modal_close`

## Todo

- [x] Create `src/lib/analytics/searchEvents.ts` with event functions
- [x] Update `SearchModalProvider.tsx` to track modal open/close
- [x] Update `SearchResults.tsx` to track result clicks with index
- [x] Update `useSearch.ts` to track search queries
- [x] Test events in GTM preview mode
- [x] Configure GTM triggers and tags for new events
