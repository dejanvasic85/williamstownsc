# Site-Wide Search Plan

## Status: Backend Complete ✅ | Frontend In Progress 🚧

Backend search API fully implemented and tested. SearchModal component with keyboard shortcuts complete.

Branch: `claude/implement-site-search-Bf4Im`

**Next Steps**:

1. Implement SearchInput component with debouncing (400ms)
2. Implement SearchResults component with grouped results
3. Connect components to `/api/search` endpoint
4. Add search button to mobile navbar (optional)

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

### Phase 2: Frontend UI Components 🚧

#### 2.1 Search Modal Component

- **Files**:
  - `src/components/search/SearchModal.tsx`
  - `src/components/search/SearchModalProvider.tsx`
  - `src/components/search/index.ts`
- **Features**:
  - Native HTML `<dialog>` element for accessibility
  - React Context-based state management (SearchModalProvider)
  - Global keyboard shortcut listener (Cmd/Ctrl+K)
  - ESC and outside-click to close (simplified backdrop detection)
  - Focus management (save/restore on open/close)
  - Dark theme support with DaisyUI classes
  - Mobile responsive (full-screen on mobile, centered on desktop)
  - Cross-platform keyboard shortcut display (⌘K / Ctrl+K)
- **Status**: ✅ Complete (PR #157)

#### 2.2 Search Input Component

- **File**: `src/components/search/SearchInput.tsx`
- **Features**:
  - Textbox with Lucide search icon
  - Debounced input (400ms)
  - Loading state indicator
  - Clear button when text present
  - ARIA labels for accessibility
  - Minimum 2 characters before search
- **Status**: ⏳ Pending

#### 2.3 Search Results Component

- **File**: `src/components/search/SearchResults.tsx`
- **Features**:
  - Results grouped by content type
  - DaisyUI styled cards/list items
  - Show title, excerpt, content type badge
  - Empty state messaging
  - Keyboard navigation (arrow keys)
  - Click result navigates and closes modal
- **Status**: ⏳ Pending

### Phase 3: Integration 🚧

#### 3.1 Navbar Integration

- **Files**:
  - `src/components/layout/DesktopNavbar.tsx`
  - `src/components/layout/MobileNavbar.tsx` (pending)
- **Changes**:
  - ✅ Add search icon button (desktop)
  - ⏳ Add search icon button (mobile) - optional
  - ✅ Wire up to open SearchModal via useSearchModal hook
  - ✅ Keyboard shortcut hint on hover tooltip
- **Status**: 🚧 Partial (Desktop complete, Mobile pending)

#### 3.2 Global Keyboard Shortcut

- **Files**:
  - `src/app/(site)/layout.tsx` (SearchModalProvider wrapper)
  - `src/components/search/SearchModal.tsx` (keyboard listener)
- **Implementation**:
  - ✅ Listen for Cmd/Ctrl+K globally
  - ✅ Open SearchModal on shortcut
  - ✅ Prevent default browser behavior
  - ✅ SearchModalProvider added to site layout
- **Status**: ✅ Complete

---

## Implementation Details

### Files Created

#### Backend (Phase 1) ✅

1. **`src/lib/content/search.ts`** - Search service with GROQ query and result transformation
2. **`src/app/api/search/route.ts`** - GET endpoint for search API

#### Frontend (Phase 2 & 3) 🚧

3. **`src/components/search/SearchModal.tsx`** - Modal component with keyboard shortcuts
4. **`src/components/search/SearchModalProvider.tsx`** - React Context for state management
5. **`src/components/search/index.ts`** - Barrel export for search components

### Files Modified

1. **`src/app/(site)/layout.tsx`** - Added SearchModalProvider wrapper and SearchModal component
2. **`src/components/layout/DesktopNavbar.tsx`** - Added search button with keyboard shortcut hint

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

- ⏳ Keyboard navigation (arrow keys, enter, ESC)
- ⏳ ARIA labels and live regions
- ⏳ Focus management (focus trap in modal)
- ⏳ Screen reader announcements
- ⏳ Clear visual focus indicators
- ⏳ Works in light and dark themes

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

### Frontend Testing 🚧

- [x] Modal opens with Cmd/Ctrl+K
- [x] Search icon in navbar opens modal (desktop)
- [ ] Typing triggers debounced search
- [ ] Results display grouped by type
- [ ] Click result navigates and closes modal
- [x] ESC closes modal
- [x] Click outside closes modal
- [x] Works on mobile (full-screen)
- [x] Works on desktop (centered modal)
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly
- [x] Works in light theme
- [x] Works in dark theme

### Accessibility Testing 🚧

- [x] Tab through search modal
- [ ] Arrow keys navigate results
- [ ] Enter selects result
- [x] ESC closes modal
- [x] Focus trapped in modal when open (focus management implemented)
- [ ] Screen reader announces results
- [ ] Screen reader announces "no results"
- [x] ARIA labels present and correct (Close button has aria-label)
- [x] Works with keyboard only (Cmd/Ctrl+K to open, ESC to close)

---

## Key Files Reference

| Component            | Path                                            | Purpose                     | Status |
| -------------------- | ----------------------------------------------- | --------------------------- | ------ |
| Search Service       | `src/lib/content/search.ts`                     | GROQ query and transformer  | ✅     |
| Search API           | `app/api/search/route.ts`                       | Backend search endpoint     | ✅     |
| Search Modal         | `src/components/search/SearchModal.tsx`         | Modal UI component          | ✅     |
| Search Provider      | `src/components/search/SearchModalProvider.tsx` | State management context    | ✅     |
| Search Barrel Export | `src/components/search/index.ts`                | Component exports           | ✅     |
| Search Input         | `src/components/search/SearchInput.tsx`         | Input with debounce         | ⏳     |
| Search Results       | `src/components/search/SearchResults.tsx`       | Results display             | ⏳     |
| Desktop Navbar       | `src/components/layout/DesktopNavbar.tsx`       | Desktop search button       | ✅     |
| Mobile Navbar        | `src/components/layout/MobileNavbar.tsx`        | Mobile search button        | ⏳     |
| Site Layout          | `src/app/(site)/layout.tsx`                     | SearchModalProvider wrapper | ✅     |

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

1. **User Testing of Backend** ✅
   - Backend API tested and verified
   - Search results quality confirmed
   - URL generation correct for all content types

2. **Search Modal Infrastructure** ✅
   - ✅ Created `src/components/search/` directory
   - ✅ Implemented `SearchModal.tsx` with native dialog element
   - ✅ Implemented `SearchModalProvider.tsx` with React Context
   - ✅ Added global keyboard shortcut listener (Cmd/Ctrl+K)
   - ✅ Implemented focus management and accessibility
   - ✅ Added to site layout (`src/app/(site)/layout.tsx`)

3. **Desktop Navbar Integration** ✅
   - ✅ Added search icon button to desktop navbar
   - ✅ Wired up click handler to open SearchModal
   - ✅ Added visual hint for keyboard shortcut (title tooltip)

### Immediate Next Steps 🚧

1. **SearchInput Component**
   - Implement `SearchInput.tsx` with debouncing (400ms)
   - Add Lucide search icon
   - Add loading state indicator
   - Add clear button when text present
   - Minimum 2 characters before search
   - ARIA labels for accessibility

2. **SearchResults Component**
   - Implement `SearchResults.tsx` with grouped results
   - Group results by content type (News, Teams, Programs, Pages)
   - Show title, excerpt, content type badge
   - Empty state messaging ("No results found")
   - Keyboard navigation (arrow keys)
   - Click result navigates and closes modal

3. **Connect to API**
   - Wire up SearchInput to `/api/search` endpoint
   - Handle loading states
   - Handle error states
   - Display results in SearchResults component

4. **Testing & Polish**
   - Test search functionality end-to-end
   - Verify debouncing works correctly
   - Test keyboard navigation through results
   - Accessibility testing (keyboard nav, screen readers)
   - Cross-browser testing

5. **Mobile Navbar Integration (Optional)**
   - Add search icon button to mobile navbar
   - Test on mobile devices

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
