# GTM Integration for Next.js 16 App Router

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
- [ ] GTM scripts load on all pages
- [ ] Page views tracked on initial load
- [ ] Page views tracked during client-side navigation
- [ ] Custom events can be sent via `sendGTMEvent`
- [ ] GTM disabled in dev environment
- [ ] No console errors or warnings
- [ ] Build passes (`npm run build`)
- [ ] Type checking passes (`npm run type:check`)

## Todo

### 1. Install dependencies
- [ ] Add `@next/third-parties` package (latest version)

### 2. Create GTM components
- [ ] Create `src/components/analytics/GoogleTagManager.tsx` - server component wrapper
- [ ] Create `src/components/analytics/PageViewTracker.tsx` - client component for App Router navigation tracking
- [ ] Create `src/components/analytics/index.ts` - barrel exports

### 3. Update root layout
- [ ] Fetch analytics settings from Sanity in `src/app/layout.tsx`
- [ ] Add GTM component with conditional rendering (production only)
- [ ] Add PageViewTracker client component

### 4. Environment handling
- [ ] Add env check utility or use existing `isLocal()` from config
- [ ] Ensure GTM only loads when `gtmId` exists and not in dev

### 5. Testing & validation
- [ ] Test initial page load tracking
- [ ] Test client-side navigation tracking
- [ ] Verify GTM in browser devtools (dataLayer)
- [ ] Test custom event firing (optional)
- [ ] Run `npm run lint`
- [ ] Run `npm run format`
- [ ] Run `npm run type:check`
- [ ] Run `npm run build`

### 6. Documentation
- [ ] Update `docs/todo.md` - mark Google analytics integration as complete
- [ ] Add comment explaining GTM setup in root layout

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
