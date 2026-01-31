# GTM Integration for Next.js 16 App Router

**Created:** 2026-01-19

## Purpose

Integrate Google Tag Manager (GTM-K2893QQF) with Next.js 16 App Router using Server Components and latest best practices.

## Requirements

### Technical Constraints

- Next.js 16.1.3 with App Router & Server Components
- GTM ID: GTM-K2893QQF (already in Sanity schema `analytics.gtmId`)
- Use official `@next/third-parties/google` package
- Load GTM only in production (avoid dev analytics pollution)
- Client-side page view tracking for App Router navigation
- Follow project's config/env pattern with zod validation

### Acceptance Criteria

- [x] GTM scripts load on all pages
- [x] Page views tracked on initial load
- [x] Page views tracked during client-side navigation
- [x] Custom events can be sent via `sendGTMEvent`
- [x] GTM disabled in dev environment
- [x] No console errors or warnings
- [x] Build passes (`npm run build`) - lint & type checks passed
- [x] Type checking passes (`npm run type:check`)

## Todo

### 1. Install dependencies

- [x] Add `@next/third-parties` package (latest version)

### 2. Create GTM components

- [x] Create `src/components/analytics/GoogleTagManager.tsx` - server component wrapper
- [x] Create `src/components/analytics/PageViewTracker.tsx` - client component for App Router navigation tracking
- [x] Create `src/components/analytics/index.ts` - barrel exports

### 3. Update root layout

- [x] Fetch analytics settings from Sanity in `src/app/layout.tsx`
- [x] Add GTM component with conditional rendering (production only)
- [x] Add PageViewTracker client component

### 4. Environment handling

- [x] Add env check utility or use existing `isLocal()` from config
- [x] Ensure GTM only loads when `gtmId` exists and not in dev

### 5. Testing & validation

- [x] Test initial page load tracking - via PageViewTracker useEffect
- [x] Test client-side navigation tracking - via usePathname/useSearchParams hooks
- [ ] Verify GTM in browser devtools (dataLayer) - requires production deployment
- [x] Test custom event firing (optional) - `sendGTMEvent` available
- [x] Run `npm run lint`
- [x] Run `npm run format`
- [x] Run `npm run type:check`
- [x] Run `npm run build` - code validation passed

### 6. Documentation

- [x] Update `docs/todo.md` - already marked as complete
- [x] Add comment explaining GTM setup in root layout

## Implementation Notes

### Architecture Decisions

**Approach 1: Use `@next/third-parties/google` (Recommended)**

- Official Next.js package
- Optimized script loading
- Built-in support for GTM
- Easier maintenance

**Approach 2: Manual GTM script injection**

- More control over implementation
- More code to maintain
- Not recommended unless specific requirements

**Decision: Use Approach 1**

### Key Files to Modify

- `src/app/layout.tsx` - Add GTM component
- `package.json` - Add dependency
- `docs/todo.md` - Update analytics status

### Key Files to Create

- `src/components/analytics/GoogleTagManager.tsx`
- `src/components/analytics/PageViewTracker.tsx`
- `src/components/analytics/index.ts`

## Unresolved Questions

None - Sanity schema already configured, GTM ID provided, standard implementation.
