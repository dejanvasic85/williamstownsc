# Fix Search Result URLs

## Purpose

Search results are pointing to incorrect URLs causing 404 errors. For example, "committee" goes to `/committee` instead of `/club/committee`.

## Problem Analysis

The `pageTypeToSlugMap` in `/src/lib/content/search.ts` maps page types to simple slugs without considering the actual route structure:

| Content Type | Current URL | Correct URL |
|---|---|---|
| `committeePage` | `/committee` | `/club/committee` |
| `aboutPage` | `/about` | `/club/about` |
| `locationsPage` | `/locations` | `/club/locations` |
| `programsPage` | `/programs` | `/football/programs` |
| `merchandisePage` | `/merchandise` | `/football/merchandise` |
| `teamsPage` | `/teams` | `/football/teams` |

Root-level pages that are correct:
- `accessibilityPage` → `/accessibility` ✓
- `contactPage` → `/contact` ✓
- `keyDatesPage` → `/key-dates` ✓
- `newsPage` → `/news` ✓
- `policiesPage` → `/policies` ✓
- `privacyPage` → `/privacy` ✓
- `sponsorsPage` → `/sponsors` ✓
- `termsPage` → `/terms` ✓

## Solution

Update `pageTypeToSlugMap` to include full paths instead of just slugs:

```typescript
const pageTypeToSlugMap: Record<string, string> = {
  // Club pages
  aboutPage: 'club/about',
  committeePage: 'club/committee',
  locationsPage: 'club/locations',

  // Football pages
  merchandisePage: 'football/merchandise',
  programsPage: 'football/programs',
  teamsPage: 'football/teams',

  // Root-level pages
  accessibilityPage: 'accessibility',
  contactPage: 'contact',
  keyDatesPage: 'key-dates',
  newsPage: 'news',
  policiesPage: 'policies',
  privacyPage: 'privacy',
  sponsorsPage: 'sponsors',
  termsPage: 'terms'
};
```

## Tasks

- [ ] Update `pageTypeToSlugMap` in `src/lib/content/search.ts` with correct paths
- [ ] Verify all page routes match their actual Next.js file structure
- [ ] Run lint, format, and type-check
- [ ] Test search functionality manually

## Files to Modify

- `src/lib/content/search.ts` - Update URL mapping

## Unresolved Questions

None - the solution is straightforward.
