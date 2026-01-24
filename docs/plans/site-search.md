# Site-Wide Search Plan

## Status: Backend ✅ | Modal Shell ✅ | Search Functionality ✅ | Testing Pending ⏳

**What's Done**:

- ✅ Backend API at `/api/search` with GROQ queries
- ✅ Modal infrastructure with ⌘K/Ctrl+K keyboard shortcuts
- ✅ Desktop navbar integration
- ✅ Search input component with debouncing (400ms)
- ✅ Results display component with grouped results
- ✅ API integration and state management
- ✅ Mobile navbar button

**What's Needed**:

- ⏳ End-to-end testing
- ⏳ Accessibility testing

---

## Overview

Implement site-wide search functionality using Sanity CMS GROQ queries with a modal-based search interface (Cmd/Ctrl+K pattern).

### Architecture Decision

**Chosen Approach**: GROQ-based search (native Sanity CMS)

- No additional dependencies or costs
- Works with existing Sanity client
- Built-in relevance scoring
- Suitable for current content volume
- Can migrate to Algolia/Meilisearch later if needed

### UX Pattern

**Modal/Dialog Search** (not dedicated search page)

- Stays in context - users don't lose their place
- Search-as-you-type with debouncing
- Keyboard shortcut (Cmd/Ctrl+K) to open
- Mobile: full-screen overlay
- Desktop: centered modal
- ESC to close, click outside to close
- Results grouped by content type

---

## Components to Build

### 1. Search Input Component ✅

**File**: `src/components/search/SearchInput.tsx`

- ✅ Textbox with Lucide search icon
- ✅ Debounced input (400ms)
- ✅ Loading state indicator (spinning icon)
- ✅ Clear button when text present
- ✅ ARIA labels for accessibility
- ✅ Minimum 2 characters validation
- ✅ Auto-focus on mount

### 2. Search Results Component ✅

**File**: `src/components/search/SearchResults.tsx`

- ✅ Results grouped by content type (News, Teams, Programs, Pages)
- ✅ DaisyUI styled cards/list items
- ✅ Show title, excerpt, content type badge
- ✅ Empty state messaging ("No results found")
- ✅ Error state handling with ARIA live regions
- ✅ Keyboard navigation (enter key on results)
- ✅ Click result navigates to URL and closes modal
- ✅ Results count display

### 3. Integrate into SearchModal ✅

**File**: `src/components/search/SearchModal.tsx`

- ✅ Replace placeholder content
- ✅ Add SearchInput and SearchResults components
- ✅ Wire up search state management (useState hooks)
- ✅ Handle loading and error states
- ✅ Connect to `/api/search` endpoint
- ✅ Clear state on modal close

### 4. Mobile Navbar Button ✅

**File**: `src/components/layout/MobileNavbar.tsx`

- ✅ Add search icon button (Lucide Search icon)
- ✅ Wire up click handler to `openSearchModal()`
- ✅ Consistent styling with other nav items
- ✅ Haptic feedback on click

---

## Backend API Reference

**Endpoint**: `GET /api/search?q={query}`

**Request**:

- `q` (required) - Search query string (minimum 2 characters)

**Response**:

```json
{
	"results": [
		{
			"_id": "doc-id",
			"_type": "newsArticle",
			"title": "Article Title",
			"excerpt": "First 150 characters...",
			"url": "/news/article-slug",
			"_score": 3.5
		}
	],
	"query": "search term",
	"count": 5
}
```

**Error Responses**:

- `400` - Missing query parameter or query too short
- `500` - Server error

## Searchable Content

- News articles (title, excerpt, content)
- Teams (name, description)
- Programs (title, description)
- Pages (heading, introduction, body)

---

## Technical Requirements

### Accessibility (AA Compliant)

- ✅ Keyboard navigation within results (enter key)
- ✅ ARIA live regions for results
- ✅ Focus management (auto-focus input on open)
- ✅ Screen reader announcements (aria-live, role attributes)
- ✅ Clear visual focus indicators
- ⏳ Full keyboard navigation (arrow keys between results) - pending testing

### Performance

- ✅ Debouncing (400ms)
- ✅ Backend handles: input validation, sanitization, relevance scoring
- ✅ Efficient state management with React hooks

---

## Testing Checklist

### Search Functionality (Pending Implementation)

- [ ] Search icon in mobile navbar opens modal
- [ ] Typing triggers debounced search (400ms)
- [ ] Results display grouped by type
- [ ] Click result navigates and closes modal
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly
- [ ] Error state displays correctly
- [ ] Minimum 2 characters validation works
- [ ] Clear button clears search input
- [ ] Results update as user types

### Accessibility (Pending Implementation)

- [ ] Tab through search modal elements (input, results)
- [ ] Arrow keys navigate results
- [ ] Enter selects result
- [ ] Focus trapped in modal when open
- [ ] Screen reader announces results count
- [ ] Screen reader announces "no results"
- [ ] Search input has proper ARIA labels
- [ ] Results list has proper ARIA roles (list/listitem)
- [ ] Loading state announced to screen readers (aria-live)
- [ ] Error state announced to screen readers

## Key Files

| File                                            | Status |
| ----------------------------------------------- | ------ |
| `src/lib/content/search.ts`                     | ✅     |
| `src/app/api/search/route.ts`                   | ✅     |
| `src/components/search/SearchModal.tsx`         | ✅     |
| `src/components/search/SearchModalProvider.tsx` | ✅     |
| `src/components/search/SearchInput.tsx`         | ✅     |
| `src/components/search/SearchResults.tsx`       | ✅     |
| `src/components/layout/DesktopNavbar.tsx`       | ✅     |
| `src/components/layout/MobileNavbar.tsx`        | ✅     |
