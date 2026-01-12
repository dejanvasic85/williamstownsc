# Site-Wide Search Plan

## Status: Backend Complete ✅ | Modal Infrastructure Complete ✅ | Search UI Pending ⏳

- ✅ Backend search API fully implemented and merged
- ✅ Search modal infrastructure with keyboard shortcuts (⌘K/Ctrl+K) implemented
- ✅ Desktop navbar integration complete
- ⏳ Search input, results display, and API integration pending

**Merged PRs**:
- #155 - Backend search API (branch: `claude/plan-site-search-EsdGm`)
- #157 - Search modal infrastructure (branch: `claude/implement-site-search-Bf4Im`)

**Next Step**: Implement search input with debouncing, results display, and integrate with backend API.

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

## Implementation Phases

### Phase 1: Backend Search API ✅

#### 1.1 Search Query Service

- **File**: `src/lib/content/search.ts`
- **Implementation**:
  - Multi-type GROQ query with `match` operator
  - Relevance scoring with `score()` function
  - Boosting for titles vs content
  - Boosting for featured content
  - Support for portable text search using `pt::text()`
  - Result transformation with URLs
  - Limit to top 20 results
- **Status**: ✅ Complete

#### 1.2 API Route

- **File**: `app/api/search/route.ts`
- **Implementation**:
  - Server-side search endpoint
  - Input validation and sanitization
  - Minimum query length enforcement (2 chars)
  - Proper error handling
  - JSON response format
- **Status**: ✅ Complete

### Phase 2: Frontend UI Components (In Progress)

#### 2.1 Search Modal Component

- **File**: `src/components/search/SearchModal.tsx`
- **Features Implemented** ✅:
  - Native HTML dialog element
  - Keyboard shortcut listener (Cmd/Ctrl+K)
  - ESC and backdrop click to close
  - Focus management (saves/restores previous focus)
  - DaisyUI styling with dark theme support
  - Mobile responsive (full-width)
  - Header with close button (X icon)
  - Help text showing keyboard shortcuts
- **Features Pending** ⏳:
  - Actual search input field
  - Integration with search API
  - Results display
- **Status**: ✅ Modal Infrastructure Complete | ⏳ Search Functionality Pending

#### 2.2 Search Input Component

- **File**: `src/components/search/SearchInput.tsx` (not yet created)
- **Features**:
  - Textbox with Lucide search icon
  - Debounced input (400ms)
  - Loading state indicator
  - Clear button when text present
  - ARIA labels for accessibility
  - Minimum 2 characters before search
- **Status**: ⏳ Pending

#### 2.3 Search Results Component

- **File**: `src/components/search/SearchResults.tsx` (not yet created)
- **Features**:
  - Results grouped by content type
  - DaisyUI styled cards/list items
  - Show title, excerpt, content type badge
  - Empty state messaging
  - Keyboard navigation (arrow keys)
  - Click result navigates and closes modal
- **Status**: ⏳ Pending

#### 2.4 Search Modal Provider

- **File**: `src/components/search/SearchModalProvider.tsx`
- **Features Implemented** ✅:
  - React Context for modal state management
  - `isOpen`, `open()`, `close()`, `toggle()` methods
  - Custom hook `useSearchModal()` with error handling
  - Type-safe context API
- **Status**: ✅ Complete

### Phase 3: Integration (In Progress)

#### 3.1 Navbar Integration

- **File**: `src/components/layout/DesktopNavbar.tsx`
- **Changes Implemented** ✅:
  - Search icon button added to desktop navbar
  - Imported `useSearchModal` hook
  - Wired up click handler to `openSearchModal()`
  - Tooltip showing "Search (⌘K)" on hover
  - Search icon from lucide-react
  - Positioned with social links in navbar
- **Changes Pending** ⏳:
  - Add search icon button to mobile navbar
- **Status**: ✅ Desktop Complete | ⏳ Mobile Pending

#### 3.2 Global Keyboard Shortcut

- **File**: `src/components/search/SearchModal.tsx`
- **Implementation** ✅:
  - Global event listener for Cmd/Ctrl+K keyboard shortcut
  - Prevents default browser behavior (e.g., browser search)
  - Opens SearchModal on shortcut activation
  - Works from anywhere in the application
  - Supports both Mac (⌘K) and Windows/Linux (Ctrl+K)
- **Status**: ✅ Complete

#### 3.3 Layout Integration

- **File**: `src/app/(site)/layout.tsx`
- **Implementation** ✅:
  - `SearchModalProvider` wraps entire site layout
  - `SearchModal` rendered at root level (after Footer)
  - Provides global access to search modal state
  - Enables search functionality across all pages
- **Status**: ✅ Complete

---

## Implementation Details

### Files Created/Modified

**Backend (PR #155)** ✅:
1. **`src/lib/content/search.ts`** - Search service with GROQ query and result transformation
2. **`src/app/api/search/route.ts`** - GET endpoint for search API

**Frontend Infrastructure (PR #157)** ✅:
3. **`src/components/search/SearchModal.tsx`** - Modal component with keyboard shortcuts and focus management
4. **`src/components/search/SearchModalProvider.tsx`** - React Context provider for modal state
5. **`src/components/search/index.ts`** - Barrel export for search components

**Modified Files (PR #157)** ✅:
6. **`src/components/layout/DesktopNavbar.tsx`** - Added search button with icon
7. **`src/app/(site)/layout.tsx`** - Integrated SearchModalProvider and SearchModal

---

### PR #157 Implementation Summary

**What Was Built**:

PR #157 implemented the foundational search modal infrastructure without the actual search functionality. The modal serves as a placeholder that can be opened and closed, demonstrating the UX pattern before integrating with the backend API.

**Key Features**:
- ✅ **Native HTML Dialog**: Uses the `<dialog>` element for proper modal semantics and accessibility
- ✅ **Keyboard Shortcuts**: Global `⌘K` (Mac) / `Ctrl+K` (Windows/Linux) keyboard shortcut to open the modal
- ✅ **Focus Management**: Saves and restores focus when opening/closing the modal
- ✅ **Multiple Close Methods**:
  - ESC key to close
  - Click on backdrop (outside modal) to close
  - Close button (X icon) in header
  - Native dialog close event handling
- ✅ **React Context Pattern**: `SearchModalProvider` manages global modal state with `useSearchModal()` hook
- ✅ **Desktop Integration**: Search button added to desktop navbar with search icon and keyboard shortcut tooltip
- ✅ **Theme Support**: Styled with DaisyUI classes for automatic light/dark theme compatibility
- ✅ **Responsive Design**: Modal adapts to mobile (full-width) and desktop (centered, max-width)

**What's NOT Implemented**:
- ⏳ Search input field with debouncing
- ⏳ API integration with `/api/search` endpoint
- ⏳ Results display and grouping
- ⏳ Loading and error states
- ⏳ Mobile navbar search button
- ⏳ Keyboard navigation for results (arrow keys, enter)

**Current User Experience**:
When users press `⌘K`/`Ctrl+K` or click the search icon in the desktop navbar, a modal opens with placeholder text: "Search functionality coming soon..." and help text showing the keyboard shortcuts. The modal demonstrates the full interaction pattern (open, close, focus management) but doesn't perform actual searches yet.

**Technical Decisions**:
1. **Native Dialog Element**: Chosen over DaisyUI modal component for better accessibility, native backdrop support, and simpler implementation
2. **Event Target Comparison**: Backdrop clicks detected by comparing `event.target === dialogRef.current` (simplified from initial child node checking)
3. **Global Keyboard Listener**: Implemented in SearchModal component rather than layout for co-location with modal logic
4. **Placeholder-First Approach**: Modal infrastructure built first to validate UX pattern before adding search complexity

---

### Code Overview

#### Search Service (`src/lib/content/search.ts`)

**Exported Types**:

- `SearchResult` - Unified result type with `_id`, `_type`, `title`, `excerpt`, `url`, `_score`

**Functions**:

- `searchContent(searchTerm: string): Promise<SearchResult[]>` - Main search function

**Features Implemented**:

- Multi-type GROQ query across news articles, teams, programs, and 15 page types
- Input sanitization with GROQ special character escaping
- Text matching on multiple fields:
  - Direct fields: `title`, `name` (for teams/programs), `heading` (for pages), `excerpt`
  - Portable text fields: `description`, `content`, `body`, `introduction` (using `pt::text()`)
- Relevance scoring with boosting:
  - Title/name/heading matches: 3x boost
  - Featured content: 2x boost
  - News articles: 1x boost
- Result transformation:
  - Extracts first 150 characters from portable text for excerpts
  - Type-safe portable text parsing with type guards
  - Generates proper URLs based on content type
  - Maps page types to URL slugs
- Limited to top 20 results ordered by score

**URL Generation Logic**:

- News articles: `/news/{slug}`
- Teams: `/teams#{slug}` (anchor link to team section)
- Programs: `/programs#{slug}` (anchor link to program section)
- Pages: `/{page-slug}` (e.g., `/about`, `/policies`)

#### Search API Route (`src/app/api/search/route.ts`)

**Endpoint**: `GET /api/search?q={query}`

**Request Parameters**:

- `q` (required) - Search query string (minimum 2 characters)

**Response Format**:

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
- `500` - Server error (includes details in development mode)

**Security Features**:

- Input validation (trim, minimum length)
- GROQ special character sanitization (escapes `*`, `[`, `]`, `{`, `}`, `(`, `)`, `\`)
- Server-side execution only
- Error details hidden in production
- Stack traces included in development mode for debugging

---

---

## Searchable Content Types

### High Priority (Implemented)

- ✅ `newsArticle` - title, excerpt, content (portable text)
- ✅ `team` - name, description
- ✅ `program` - title, description
- ✅ Pages - heading, introduction, body (portable text)
  - aboutPage, policiesPage, programsPage, teamsPage, etc.

### Medium Priority (Future)

- ⏳ `person` / `player` / `coach` - names, bio
- ⏳ `announcement` - title, content
- ⏳ `sponsor` - name, description

### Excluded

- ❌ `siteSettings` - not user-searchable
- ❌ `keyDateItem` / `committeeMember` - too granular

---

## Technical Considerations

### Performance

- ✅ Server-side search (API route)
- ⏳ Debouncing (400ms) - frontend
- ✅ Minimum query length (2 chars)
- ⏳ Result caching (future optimization)
- ✅ Limited result set (20 max)

### SEO

- ✅ No dedicated search results page (modal only)
- ✅ No duplicate content issues
- ⏳ Optional: search analytics tracking

### Security

- ✅ Input sanitization (trim, validation, GROQ character escaping)
- ✅ Server-side execution
- ⏳ Rate limiting (future consideration - see Future Enhancements)
- ✅ Respects published content only

### Accessibility (AA Compliant)

**Implemented** ✅:
- ✅ Keyboard shortcuts (⌘K/Ctrl+K, ESC)
- ✅ Focus management (saves/restores focus)
- ✅ Native dialog semantics
- ✅ ARIA labels on buttons
- ✅ Works in light and dark themes

**Pending** ⏳:
- ⏳ Keyboard navigation within results (arrow keys, enter)
- ⏳ ARIA live regions for results
- ⏳ Focus trap in modal (prevent tab escape)
- ⏳ Screen reader result announcements
- ⏳ Clear visual focus indicators in results list

### PWA Compatibility

- ✅ Works offline with cached data (Next.js ISR)
- ⏳ Search shortcut works when installed

---

## Testing Checklist

### Backend Testing ⏳ (Requires Environment Setup)

**Prerequisites**:

- Sanity environment variables must be set:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION` (optional, defaults to 2024-01-01)

**Test Commands** (run after `npm run dev`):

1. **Test with no query parameter** (should return 400 error):

   ```bash
   curl "http://localhost:3003/api/search"
   ```

   Expected: `{"error":"Search query parameter \"q\" is required"}`

2. **Test with query < 2 characters** (should return 400 error):

   ```bash
   curl "http://localhost:3003/api/search?q=a"
   ```

   Expected: `{"error":"Search query must be at least 2 characters long"}`

3. **Test with valid query**:

   ```bash
   curl "http://localhost:3003/api/search?q=team" | jq
   ```

   Expected: JSON with `results`, `query`, and `count` fields

4. **Test news articles search**:

   ```bash
   curl "http://localhost:3003/api/search?q=news" | jq
   ```

5. **Test teams search**:

   ```bash
   curl "http://localhost:3003/api/search?q=under" | jq
   ```

6. **Test programs search**:

   ```bash
   curl "http://localhost:3003/api/search?q=miniroos" | jq
   ```

7. **Test pages search**:
   ```bash
   curl "http://localhost:3003/api/search?q=about" | jq
   ```

**Manual Verification Checklist**:

- [ ] Test API with query < 2 chars (should return 400)
- [ ] Test API with missing query param (should return 400)
- [ ] Test API with valid query (should return results)
- [ ] Verify news articles are searchable
- [ ] Verify teams are searchable
- [ ] Verify programs are searchable
- [ ] Verify pages are searchable
- [ ] Verify portable text content is searchable
- [ ] Verify results include proper URLs
- [ ] Verify scoring/relevance ordering (title matches ranked higher)
- [ ] Verify excerpt generation works correctly
- [ ] Verify search works with special characters
- [ ] Verify search is case-insensitive

### Frontend Testing

**Modal Infrastructure (PR #157)** ✅:

- [x] Modal opens with Cmd/Ctrl+K
- [x] Search icon in desktop navbar opens modal
- [x] ESC closes modal
- [x] Click outside (backdrop) closes modal
- [x] Close button (X) closes modal
- [x] Works on desktop (centered modal)
- [x] Works in light theme
- [x] Works in dark theme
- [x] Focus is saved and restored when modal opens/closes
- [x] Keyboard shortcut prevents default browser behavior

**Search Functionality** ⏳ (Not Yet Implemented):

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

### Accessibility Testing

**Modal Infrastructure (PR #157)** ✅:

- [x] ESC closes modal
- [x] Focus management works (saves/restores previous focus)
- [x] Works with keyboard only (⌘K/Ctrl+K to open, ESC to close)
- [x] Native dialog semantics (role="dialog")
- [x] Close button has proper aria-label ("Close search")
- [x] Search button in navbar has aria-label and title

**Search Functionality** ⏳ (Not Yet Implemented):

- [ ] Tab through search modal elements (input, results)
- [ ] Arrow keys navigate results
- [ ] Enter selects result
- [ ] Focus trapped in modal when open (prevent tabbing out)
- [ ] Screen reader announces results count
- [ ] Screen reader announces "no results"
- [ ] Search input has proper ARIA labels
- [ ] Results list has proper ARIA roles (list/listitem)
- [ ] Loading state announced to screen readers (aria-live)
- [ ] Error state announced to screen readers

---

## Key Files Reference

| Component              | Path                                           | Purpose                           | Status     |
| ---------------------- | ---------------------------------------------- | --------------------------------- | ---------- |
| Search Service         | `src/lib/content/search.ts`                    | GROQ query and transformer        | ✅         |
| Search API             | `src/app/api/search/route.ts`                  | Backend search endpoint           | ✅         |
| Search Modal           | `src/components/search/SearchModal.tsx`        | Modal infrastructure & shortcuts  | ✅         |
| Search Modal Provider  | `src/components/search/SearchModalProvider.tsx`| Modal state management            | ✅         |
| Search Input           | `src/components/search/SearchInput.tsx`        | Input with debounce (not created) | ⏳         |
| Search Results         | `src/components/search/SearchResults.tsx`      | Results display (not created)     | ⏳         |
| Desktop Navbar         | `src/components/layout/DesktopNavbar.tsx`      | Search button (desktop)           | ✅         |
| Mobile Navbar          | `src/components/layout/MobileNavbar.tsx`       | Search button (mobile)            | ⏳         |
| Layout Integration     | `src/app/(site)/layout.tsx`                    | Provider & modal placement        | ✅         |
| Barrel Export          | `src/components/search/index.ts`               | Component exports                 | ✅         |

---

## GROQ Query Details

### Search Query Structure

```groq
*[
  _type in ["newsArticle", "team", "program", ...pages]
  && (
    title match $searchTerm ||
    name match $searchTerm ||
    heading match $searchTerm ||
    excerpt match $searchTerm ||
    description match $searchTerm ||
    pt::text(body) match $searchTerm ||
    pt::text(content) match $searchTerm ||
    pt::text(introduction) match $searchTerm
  )
] | score(
  title match $searchTerm,
  name match $searchTerm,
  heading match $searchTerm,
  boost(title match $searchTerm, 3),
  boost(name match $searchTerm, 3),
  boost(heading match $searchTerm, 3),
  boost(featured == true, 2),
  boost(_type == "newsArticle", 1)
) | order(_score desc) [0...20]
```

### Scoring Strategy

1. **Title/Heading Matches** (3x boost) - highest priority
2. **Featured Content** (2x boost) - editorial priority
3. **News Articles** (1x boost) - content freshness
4. **Body Text Matches** (1x base) - comprehensive search

### URL Generation Logic

- `newsArticle`: `/news/${slug}`
- `team`: `/teams#${slug}` (anchor link)
- `program`: `/programs#${slug}` (anchor link)
- Pages: `/${slug}` (e.g., /about, /policies)

---

## Resources

- [GROQ Query Cheat Sheet](https://www.sanity.io/docs/content-lake/query-cheat-sheet)
- [GROQ Text Matching](https://www.sanity.io/docs/groq-functions)
- [Sanity Client Next.js](https://www.sanity.io/docs/next-js)

---

## Next Steps for Frontend Implementation

### Completed ✅

1. ✅ **Backend Search API** (PR #155)
   - Search service with GROQ queries
   - API endpoint at `/api/search`
   - Input validation and sanitization
   - Relevance scoring and result transformation

2. ✅ **Modal Infrastructure** (PR #157)
   - SearchModal component with native dialog
   - SearchModalProvider with React Context
   - Global keyboard shortcuts (⌘K/Ctrl+K)
   - Focus management and accessibility basics
   - Desktop navbar integration
   - Layout integration with provider

### Immediate Next Steps ⏳

1. **Search Input Component**
   - Create `src/components/search/SearchInput.tsx`
   - Implement debounced input (400ms) using `useDebouncedValue` or similar
   - Add search icon from lucide-react
   - Loading state indicator
   - Clear button when text present
   - ARIA labels for accessibility
   - Minimum 2 characters validation

2. **Search Results Component**
   - Create `src/components/search/SearchResults.tsx`
   - Fetch results from `/api/search` endpoint
   - Group results by content type (News, Teams, Programs, Pages)
   - Display title, excerpt, and content type badge
   - Empty state messaging ("No results found")
   - Error state handling
   - Click result navigates to URL and closes modal

3. **Integrate Components into SearchModal**
   - Replace placeholder content in SearchModal
   - Add SearchInput component
   - Add SearchResults component
   - Wire up search state management
   - Handle loading and error states

4. **Mobile Navbar Integration**
   - Add search icon button to mobile navbar
   - Wire up click handler to `openSearchModal()`
   - Ensure responsive behavior

5. **Testing & Polish**
   - Test search functionality end-to-end
   - Test on mobile devices (full-screen overlay)
   - Test on desktop (centered modal)
   - Verify dark theme compatibility
   - Accessibility testing (keyboard nav, screen readers)
   - Cross-browser testing

### Future Enhancements (Optional)

5. **Analytics & Monitoring**
   - Track search queries (Google Analytics)
   - Monitor popular searches
   - Identify search terms with no results

6. **Performance Optimization**
   - Consider caching popular searches (SWR/React Query)
   - Add search query history (localStorage)
   - Implement search suggestions/autocomplete

7. **Feature Expansion**
   - Add content type filters (News, Teams, Programs, Pages)
   - Add date range filters for news articles
   - Implement "search within results"
   - Add keyboard shortcuts for result navigation (j/k keys)

8. **Security & Performance Hardening**
   - **Rate Limiting**: Implement rate limiting on `/api/search` endpoint to prevent abuse
     - Options: Vercel Edge Config, Upstash Redis, or custom middleware
     - Recommended limits: 30 requests per minute per IP
     - Return 429 (Too Many Requests) when limit exceeded
     - Consider separate limits for authenticated vs anonymous users
   - API key authentication for programmatic access (if needed)
   - Request throttling based on user session

---

## Notes

- Backend uses Next.js 15 App Router conventions
- All search queries run server-side for security
- Modal pattern chosen over dedicated page for better UX
- Can expand to more content types (announcements, sponsors) later
- Future: add filters by content type, date ranges
