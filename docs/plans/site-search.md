# Site-Wide Search Plan

## Status: Backend Complete ✅ | Frontend Pending ⏳

Backend search API fully implemented and ready for testing. Frontend UI components pending user testing and approval of backend.

Branch: `claude/plan-site-search-EsdGm`

**Next Step**: User should test the backend API with their Sanity data before proceeding with frontend implementation.

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

### Phase 2: Frontend UI Components ⏳

#### 2.1 Search Modal Component
- **File**: `src/components/search/SearchModal.tsx`
- **Features**:
  - DaisyUI modal component
  - Keyboard shortcut listener (Cmd/Ctrl+K)
  - ESC and outside-click to close
  - Focus trap within modal
  - Dark theme support
  - Mobile responsive
- **Status**: ⏳ Pending

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

### Phase 3: Integration ⏳

#### 3.1 Navbar Integration
- **File**: `src/components/layout/Navbar.tsx`
- **Changes**:
  - Add search icon button (desktop)
  - Add search icon button (mobile)
  - Wire up to open SearchModal
  - Keyboard shortcut hint on hover
- **Status**: ⏳ Pending

#### 3.2 Global Keyboard Shortcut
- **File**: `src/app/(site)/layout.tsx` or SearchModal
- **Implementation**:
  - Listen for Cmd/Ctrl+K globally
  - Open SearchModal on shortcut
  - Prevent default browser behavior
- **Status**: ⏳ Pending

---

## Implementation Details

### Files Created

1. **`src/lib/content/search.ts`** - Search service with GROQ query and result transformation
2. **`src/app/api/search/route.ts`** - GET endpoint for search API

### Code Overview

#### Search Service (`src/lib/content/search.ts`)

**Exported Types**:
- `SearchResult` - Unified result type with `_id`, `_type`, `title`, `excerpt`, `url`, `_score`

**Functions**:
- `searchContent(searchTerm: string): Promise<SearchResult[]>` - Main search function

**Features Implemented**:
- Multi-type GROQ query across news articles, teams, programs, and 15 page types
- Text matching on multiple fields:
  - Direct fields: `title`, `name`, `heading`, `excerpt`
  - Portable text fields: `description`, `content`, `body`, `introduction` (using `pt::text()`)
- Relevance scoring with boosting:
  - Title/name/heading matches: 3x boost
  - Featured content: 2x boost
  - News articles: 1x boost
- Result transformation:
  - Extracts first 150 characters from portable text for excerpts
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
- Server-side execution only
- Error details hidden in production

---


---

## Searchable Content Types

### High Priority (Implemented)
- ✅ `newsArticle` - title, excerpt, content (portable text)
- ✅ `team` - teamName, description
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
- ✅ Input sanitization (trim, validation)
- ✅ Server-side execution
- ⏳ Rate limiting (future consideration)
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

### Frontend Testing ⏳
- [ ] Modal opens with Cmd/Ctrl+K
- [ ] Search icon in navbar opens modal
- [ ] Typing triggers debounced search
- [ ] Results display grouped by type
- [ ] Click result navigates and closes modal
- [ ] ESC closes modal
- [ ] Click outside closes modal
- [ ] Works on mobile (full-screen)
- [ ] Works on desktop (centered modal)
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly
- [ ] Works in light theme
- [ ] Works in dark theme

### Accessibility Testing ⏳
- [ ] Tab through search modal
- [ ] Arrow keys navigate results
- [ ] Enter selects result
- [ ] ESC closes modal
- [ ] Focus trapped in modal when open
- [ ] Screen reader announces results
- [ ] Screen reader announces "no results"
- [ ] ARIA labels present and correct
- [ ] Works with keyboard only

---

## Key Files Reference

| Component         | Path                              | Purpose                     | Status |
| ----------------- | --------------------------------- | --------------------------- | ------ |
| Search Service    | `src/lib/content/search.ts`       | GROQ query and transformer  | ✅     |
| Search API        | `app/api/search/route.ts`         | Backend search endpoint     | ✅     |
| Search Modal      | `src/components/search/...`       | Modal UI component          | ⏳     |
| Search Input      | `src/components/search/...`       | Input with debounce         | ⏳     |
| Search Results    | `src/components/search/...`       | Results display             | ⏳     |
| Navbar Integration | `src/components/layout/Navbar.tsx` | Search trigger button       | ⏳     |

---

## GROQ Query Details

### Search Query Structure

```groq
*[
  _type in ["newsArticle", "team", "program", ...pages]
  && (
    title match $searchTerm ||
    teamName match $searchTerm ||
    heading match $searchTerm ||
    excerpt match $searchTerm ||
    description match $searchTerm ||
    pt::text(body) match $searchTerm ||
    pt::text(content) match $searchTerm ||
    pt::text(introduction) match $searchTerm
  )
] | score(
  title match $searchTerm,
  teamName match $searchTerm,
  heading match $searchTerm,
  boost(title match $searchTerm, 3),
  boost(teamName match $searchTerm, 3),
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

### Immediate (After Backend Testing)

1. **User Testing of Backend** ✅ REQUIRED FIRST
   - Set up Sanity environment variables
   - Run `npm run dev`
   - Test API endpoints with curl commands (see Testing Checklist above)
   - Verify search results quality and relevance
   - Confirm URL generation is correct for all content types

2. **Frontend Component Development** (only after backend approval)
   - Create `src/components/search/` directory
   - Implement `SearchModal.tsx` with DaisyUI modal
   - Implement `SearchInput.tsx` with debouncing (400ms)
   - Implement `SearchResults.tsx` with grouped results
   - Add keyboard shortcut listener (Cmd/Ctrl+K)
   - Implement focus management and accessibility

3. **Navbar Integration**
   - Add search icon button to desktop navbar
   - Add search icon button to mobile navbar
   - Wire up click handlers to open SearchModal
   - Add visual hint for keyboard shortcut

4. **Testing & Polish**
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

---

## Notes

- Backend uses Next.js 15 App Router conventions
- All search queries run server-side for security
- Modal pattern chosen over dedicated page for better UX
- Can expand to more content types (announcements, sponsors) later
- Future: add filters by content type, date ranges
