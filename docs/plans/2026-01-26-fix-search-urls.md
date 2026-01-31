# Fix Search Result URLs

**Created:** 2026-01-26

## Purpose

Search results are pointing to incorrect URLs causing 404 errors. For example, "committee" goes to `/committee` instead of `/club/committee`.

## Problem Analysis

The `pageTypeToSlugMap` in `/src/lib/content/search.ts` mapped page types to simple slugs without considering the actual route structure. This created a maintenance burden - adding a new route required updating multiple files.

| Content Type      | Old URL        | Correct URL                      |
| ----------------- | -------------- | -------------------------------- |
| `committeePage`   | `/committee`   | `/club/committee`                |
| `aboutPage`       | `/about`       | `/club/about`                    |
| `locationsPage`   | `/locations`   | `/club/locations`                |
| `policiesPage`    | `/policies`    | `/club/policies-and-regulations` |
| `programsPage`    | `/programs`    | `/football/programs`             |
| `merchandisePage` | `/merchandise` | `/football/merchandise`          |
| `teamsPage`       | `/teams`       | `/football/teams`                |

## Solution

Created a centralized routes config (`src/lib/routes.ts`) as the single source of truth for all routes:

```typescript
export const routes = {
	// Dynamic routes
	newsArticle: (slug: string) => `/news/${slug}`,
	team: (slug: string) => `/football/teams/${slug}`,

	// Static routes
	about: () => '/club/about',
	committee: () => '/club/committee'
	// ...
};

export const contentTypeRoutes: Record<string, (slug?: string) => string> = {
	// Falls back to list page when slug is missing
	newsArticle: (slug) => (slug ? routes.newsArticle(slug) : routes.news()),
	committeePage: () => routes.committee()
	// ...
};
```

Updated `search.ts` to import and use `contentTypeRoutes` instead of hardcoded mappings.

## Tasks

- [x] Create centralized `src/lib/routes.ts` config file
- [x] Update `src/lib/content/search.ts` to use routes config
- [x] Remove unused `pageTypeToSlugMap` and `searchablePageTypes`
- [ ] Test search functionality manually

## Files Modified

- `src/lib/routes.ts` - New centralized route config
- `src/lib/content/search.ts` - Uses routes config instead of hardcoded map
