# Plan: Hide Menu Links Toggle

## Purpose

Allow content authors to hide specific pages from navigation until they're ready for launch. Rather than deleting routes, a CMS toggle lets them show/hide items from menus and footer while pages remain accessible via direct URL. This is a launch-gate feature: hide incomplete pages, enable them when content is ready.

Scope is limited to menu/footer navigation only. Dynamic pages (Home, News, Football > Teams) always remain visible.

## Key Files

- `src/lib/navigation.ts` — hardcoded `navItems` array (desktop nav source)
- `src/components/layout/DesktopNavbar.tsx` — client component, directly imports `navItems`
- `src/components/layout/MobileNavbar.tsx` — hardcoded bottom bar (Home/News/Football/Menu — no changes needed)
- `src/components/layout/Navbar.tsx` — thin wrapper rendering Desktop + Mobile navbars
- `src/components/layout/Footer.tsx` — fully hardcoded JSX links
- `src/app/(site)/menu/page.tsx` — hardcoded `menuLinks` array (mobile menu page)
- `src/app/(site)/layout.tsx` — server component; fetches `getSiteSettings()`, passes props to Navbar/Footer
- `src/sanity/schema/siteSettings.ts` — reference pattern for singleton schema
- `src/sanity/schema/index.ts` — schema registration
- `src/sanity/structure.ts` — Studio sidebar structure (singleton pattern)
- `src/lib/content/index.ts` — central re-exports for content queries

## Toggleable Items (10 total)

| Toggle key    | Route                            | Surfaces                               |
| ------------- | -------------------------------- | -------------------------------------- |
| `programs`    | `/football/programs`             | desktop nav submenu, footer            |
| `merchandise` | `/football/merchandise`          | desktop nav submenu, footer            |
| `about`       | `/club/about`                    | desktop nav submenu, footer, menu page |
| `committee`   | `/club/committee`                | desktop nav submenu, footer, menu page |
| `policies`    | `/club/policies-and-regulations` | desktop nav submenu, footer, menu page |
| `locations`   | `/club/locations`                | desktop nav submenu, footer, menu page |
| `sponsors`    | `/sponsors`                      | desktop nav, footer, menu page         |
| `contact`     | `/contact`                       | desktop nav, footer, menu page         |
| `keyDates`    | `/key-dates`                     | desktop nav                            |
| `events`      | `/events`                        | footer, menu page                      |

**Submenu parent rules:**

- Football: always visible (Teams always shown; hiding programs+merch leaves Teams only)
- Club: hidden entirely if ALL 4 sub-items are hidden

**Default:** all `true` (visible). Direct URL access always works regardless of toggle.

## Tasks

- [x] Create `src/sanity/schema/navigationSettings.ts` — singleton doc with 10 boolean fields, `initialValue: true`, descriptive labels
- [x] Register in `src/sanity/schema/index.ts`
- [x] Add singleton entry to `src/sanity/structure.ts` (below Site Settings; add `'navigationSettings'` to exclusion list)
- [x] Create `src/lib/content/navigationSettings.ts` — `getNavigationVisibility()`, `NavigationVisibility` type, revalidation tag `navigationSettings` (see Cache Invalidation section below)
- [x] Export from `src/lib/content/index.ts`
- [x] Export `NavItem` type from `src/lib/navigation.ts`
- [x] Create `src/lib/navigationTransformer.ts` — `filterNavItems()`, `buildFooterNavLinks()`, `filterMenuLinks()`, href→visibility key mapping
- [x] Update `src/app/(site)/layout.tsx` — fetch visibility in parallel, filter navItems + footer links, pass to components
- [x] Update `src/components/layout/Navbar.tsx` — accept `navItems: NavItem[]` prop, pass to `DesktopNavbar`
- [x] Update `src/components/layout/DesktopNavbar.tsx` — remove direct import, accept `navItems` as prop
- [x] Update `src/components/layout/Footer.tsx` — accept `navLinks: FooterNavLinks` prop, render columns dynamically
- [x] Update `src/app/(site)/menu/page.tsx` — make async server component, fetch visibility, filter `menuLinks`
- [x] Add `'navigationSettings'` to `allowedContentTypes` in `src/app/api/revalidate/route.ts`
- [x] `npm run type:gen`
- [x] `npm run lint && npm run format && npm run type:check`
- [x] `npm run build`
- [ ] **Verify Navigation Settings appears in Sanity Studio** — Clear browser cache, hard refresh Studio (`/studio`), verify "Navigation Settings" appears below "Site Settings" in sidebar

## Cache Invalidation

The `navigationSettings` document type uses the existing on-demand revalidation infrastructure:

**Revalidation endpoint:** `src/app/api/revalidate/route.ts`

**Required change:** Add `'navigationSettings'` to the `allowedContentTypes` Set on line 7:

```/dev/null/route.ts#L7
const allowedContentTypes = new Set([
	'announcement',
	'newsArticle',
	'team',
	'sponsor',
	'program',
	'page',
	'committeePage',
	'contactPage',
	'siteSettings',
	'navigationSettings'  // ADD THIS LINE
]);
```

**How it works:**

1. Content author toggles visibility in Sanity Studio → publishes changes
2. Sanity webhook (configured at project API settings) POSTs to `/api/revalidate` with `{"_type": "navigationSettings"}`
3. Endpoint validates secret header, calls `revalidateTag('navigationSettings', 'max')`
4. Next.js invalidates all cached content tagged with `navigationSettings`
5. Next page load fetches fresh visibility data, filters navigation accordingly

**Webhook setup:** See `docs/cache-invalidation.md` for Sanity webhook configuration (URL, headers, authentication). Existing webhook should already be configured; just ensure `navigationSettings` is added to the allowed types list above.

**Testing:** After publishing changes in Sanity, verify cache invalidation:

```bash
curl -X POST http://localhost:3003/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: your-secret-here" \
  -d '{"_type": "navigationSettings"}'
```

## Sanity Studio Verification

**Location:** The Navigation Settings singleton should appear in the Sanity Studio sidebar at `/studio`

**Expected behavior:**
- "Navigation Settings" appears as the second item in the sidebar (directly below "Site Settings")
- Already added to `src/sanity/structure.ts` on lines 10-12
- Already added to exclusion filter on line 150

**Troubleshooting if not visible:**
1. **Hard refresh the Studio** - The structure configuration is cached. Try:
   - Clear browser cache
   - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
   - Open Studio in incognito/private window
2. **Restart dev server** - Kill and restart `npm run dev`
3. **Verify schema registration** - Check `src/sanity/schema/index.ts` includes `navigationSettings` import and export (line 5 and 64)
4. **Check browser console** - Look for any Sanity configuration errors
5. **Verify Sanity config** - Ensure `sanity.config.ts` imports structure: `structureTool({ structure })`

**Files modified for Studio integration:**
- `src/sanity/schema/navigationSettings.ts` - Schema definition
- `src/sanity/schema/index.ts` - Schema registration
- `src/sanity/structure.ts` - Sidebar structure (lines 10-12, 150)

## Architecture

```
layout.tsx (server)
  ├── getNavigationVisibility() → NavigationVisibility
  ├── filterNavItems(navItems, visibility) → NavItem[]
  ├── buildFooterNavLinks(visibility) → FooterNavLinks
  │
  ├── <Navbar navItems={filtered} />
  │     └── <DesktopNavbar navItems={prop} />  (client, renders from prop)
  └── <Footer navLinks={footerNavLinks} />      (renders pre-filtered arrays)

menu/page.tsx (server, async)
  ├── getNavigationVisibility()
  └── filterMenuLinks(menuLinks, visibility) → renders dynamically
```

## Key Design Decisions

- **Singleton settings doc** (not fields on individual page schemas) — centralized control, works for non-page routes like `/events`, matches `siteSettings` pattern
- **Filter in `layout.tsx`** — single server-side fetch point, keeps client components purely prop-driven
- **Transformer module** — reusable href→visibility mapping keeps layout clean; named "transformer" per code style (no helpers/utils)
- **NavItem type** exported from `navigation.ts` — shared between transformer and components
- **Footer receives pre-filtered arrays** — footer stays a pure render component, no filtering logic inside

## Verification

1. Open Sanity Studio → Navigation Settings → toggle off e.g. "Show Sponsors"
2. Verify Sponsors disappears from desktop nav, footer, and `/menu` page
3. Verify `/sponsors` URL still loads (not 404)
4. Toggle off all 4 Club sub-items → verify "Club" parent disappears from desktop nav
5. Toggle back on → items reappear (cache invalidated via `navigationSettings` tag)
