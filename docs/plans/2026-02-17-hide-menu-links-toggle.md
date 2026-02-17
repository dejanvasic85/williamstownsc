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

| Toggle key    | Route                             | Surfaces                                    |
|---------------|-----------------------------------|---------------------------------------------|
| `programs`    | `/football/programs`              | desktop nav submenu, footer                 |
| `merchandise` | `/football/merchandise`           | desktop nav submenu, footer                 |
| `about`       | `/club/about`                     | desktop nav submenu, footer, menu page      |
| `committee`   | `/club/committee`                 | desktop nav submenu, footer, menu page      |
| `policies`    | `/club/policies-and-regulations`  | desktop nav submenu, footer, menu page      |
| `locations`   | `/club/locations`                 | desktop nav submenu, footer, menu page      |
| `sponsors`    | `/sponsors`                       | desktop nav, footer, menu page              |
| `contact`     | `/contact`                        | desktop nav, footer, menu page              |
| `keyDates`    | `/key-dates`                      | desktop nav                                 |
| `events`      | `/events`                         | footer, menu page                           |

**Submenu parent rules:**
- Football: always visible (Teams always shown; hiding programs+merch leaves Teams only)
- Club: hidden entirely if ALL 4 sub-items are hidden

**Default:** all `true` (visible). Direct URL access always works regardless of toggle.

## Tasks

- [ ] Create `src/sanity/schema/navigationSettings.ts` — singleton doc with 10 boolean fields, `initialValue: true`, descriptive labels
- [ ] Register in `src/sanity/schema/index.ts`
- [ ] Add singleton entry to `src/sanity/structure.ts` (below Site Settings; add `'navigationSettings'` to exclusion list)
- [ ] Create `src/lib/content/navigationSettings.ts` — `getNavigationVisibility()`, `NavigationVisibility` type, revalidation tag `navigationSettings`
- [ ] Export from `src/lib/content/index.ts`
- [ ] Export `NavItem` type from `src/lib/navigation.ts`
- [ ] Create `src/lib/navigationTransformer.ts` — `filterNavItems()`, `buildFooterNavLinks()`, `filterMenuLinks()`, href→visibility key mapping
- [ ] Update `src/app/(site)/layout.tsx` — fetch visibility in parallel, filter navItems + footer links, pass to components
- [ ] Update `src/components/layout/Navbar.tsx` — accept `navItems: NavItem[]` prop, pass to `DesktopNavbar`
- [ ] Update `src/components/layout/DesktopNavbar.tsx` — remove direct import, accept `navItems` as prop
- [ ] Update `src/components/layout/Footer.tsx` — accept `navLinks: FooterNavLinks` prop, render columns dynamically
- [ ] Update `src/app/(site)/menu/page.tsx` — make async server component, fetch visibility, filter `menuLinks`
- [ ] `npm run type:gen`
- [ ] `npm run lint && npm run format && npm run type:check`
- [ ] `npm run build`

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
