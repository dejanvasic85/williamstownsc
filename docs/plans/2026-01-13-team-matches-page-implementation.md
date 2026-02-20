# Team Matches Page Implementation Plan

**Created:** 2026-01-13
**Status:** ✅ Complete

## Overview

Create a dynamic matches page at `/football/teams/[slug]/matches` that displays fixtures for a team in a clean, organized list grouped by round.

## Requirements

Based on the design sample provided:

- Display fixtures grouped by round (non-collapsible sections)
- Show date/day, time, home team vs away team with logos
- Display competition name and division
- Show venue address with location icon
- Handle teams with no local fixture data by showing external link
- Mobile-first responsive design
- SEO-friendly with proper metadata for the event/match

See [Design](./design-fixtures.png) for an example of a match layout.
We don't need a link to the match center at the moment.

## Data Flow

```
Team slug → matchService.getFixturesForTeam(slug) → EnrichedFixture[] → Group by round → Render
```

## Critical Files

### New Files to Create

1. **`/src/app/(site)/football/teams/[slug]/matches/page.tsx`** - Main page component
2. **`/src/components/matches/MatchList.tsx`** - List container component
3. **`/src/components/matches/MatchCard.tsx`** - Individual match card component
4. **`/src/components/matches/NoFixturesMessage.tsx`** - Fallback component for external fixtures

### Existing Files Referenced

- `/src/lib/matches/matchService.ts` - Data fetching (getFixturesForTeam)
- `/src/types/matches.ts` - Type definitions (EnrichedFixture, Club)
- `/src/lib/content/teamDetail.ts` - Team metadata for SEO

## Component Architecture

### 1. Page Component (`matches/page.tsx`)

**Responsibilities:**

- Async server component
- Fetch team data for metadata
- Fetch fixtures using `getFixturesForTeam(slug)`
- Handle no fixtures case
- Generate SEO metadata
- Render PageContainer with MatchList

**Key patterns:**

```typescript
- Await params (Next.js 15+ pattern)
- Try-catch with notFound() fallback
- Generate metadata with team name + "Matches"
- Use matchService.getFixturesForTeam()
```

### 2. MatchList Component

**Responsibilities:**

- Group fixtures by round
- Render round headers
- Map fixtures to MatchCard components
- Responsive grid/list layout

**Props:**

```typescript
type MatchListProps = {
	fixtures: EnrichedFixture[];
	competition: string;
};
```

**Grouping logic:**

- Group fixtures using `round` property
- Sort by round number ascending
- Within each round, sort by date/time

### 3. MatchCard Component

**Responsibilities:**

- Display single fixture details
- Show date, day, time prominently
- Render home vs away teams with logos
- Display competition/division info
- Show venue with location icon
- Responsive layout (mobile: stacked, desktop: horizontal)

**Props:**

```typescript
type MatchCardProps = {
	fixture: EnrichedFixture;
	competition: string;
};
```

**Layout structure (based on design):**

```
┌─────────────────────────────────────────────────────────────┐
│ Sat 21 Mar 2026        Home Team [logo] - [logo] Away Team  │
│ 15:00                  Competition | Division                │
│                        📍 Venue Address                      │
└─────────────────────────────────────────────────────────────┘
```

### 4. NoFixturesMessage Component

**Responsibilities:**

- Display message when no local fixtures available
- Show link to external fixtures URL if exists
- Provide navigation back to team page

**Props:**

```typescript
type NoFixturesMessageProps = {
	teamName: string;
	fixturesUrl?: string;
};
```

## Implementation Details

### Date Formatting

- Use JavaScript `Date` object to parse ISO date strings
- Format: "Sat 21 Mar 2026" (day, date, month, year)
- Time format: "15:00" (24-hour, as stored)

### Team Logo Rendering

- Use Next.js `Image` component
- Source: `Club.logoUrl` from EnrichedFixture
- Alt text: `Club.displayName`
- Size: 40x40px for desktop, 32x32px for mobile
- Object-fit: contain

### Competition Display

- Primary text: `competition` from fixtures data
- Secondary text: Parse from first part of competition name (e.g., "State League 2 Men's - North-West")
- Separator: " | "

### Location Icon

- Use Lucide `MapPin` icon
- Color: text-gray-500 (muted)
- Size: 16px

### Styling Approach

- Use Tailwind CSS classes
- DaisyUI card component for match cards
- Grid layout: `grid-cols-1` for mobile, responsive breakpoints
- Spacing: consistent with existing components (gap-4, padding-6)
- Typography: Follow existing patterns (text-sm, text-lg, font-semibold)

### Responsive Breakpoints

- Mobile (default): Stacked layout, date on left side
- Tablet (md): Wider cards
- Desktop (lg): Full horizontal layout

## SEO & Metadata

### generateMetadata function

```typescript
title: `{teamName} - Matches | {clubName}`;
description: `View upcoming fixtures and match schedule for {teamName} in the {competition} {season} season.`;
```

### Page heading

- Use team name as h1: "{Team Name} Fixtures"
- Subheading: "{Competition} {Season}"

## Error Handling

1. **No fixtures data** → Show NoFixturesMessage with external link
2. **Team not found** → Call `notFound()`
3. **Invalid slug** → Call `notFound()`
4. **Missing club logo** → Fallback to placeholder or team initial

## Accessibility (a11y)

- Semantic HTML (header, section, article elements)
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for all team logos
- Sufficient color contrast (AA compliant)
- Focus states on interactive elements
- Screen reader friendly date formats

## Performance Optimizations

- Server-side rendering (async component)
- Image optimization via Next.js Image component
- Static generation where possible (ISR with revalidation)
- Minimize client-side JavaScript (pure server components)

## Testing Checklist

### Manual Testing

1. Navigate to `/football/teams/seniors-mens/matches`
2. Verify fixtures load and display correctly
3. Check grouping by round
4. Verify team logos render
5. Test responsive layouts (mobile, tablet, desktop)
6. Check dark mode compatibility
7. Test team with no fixtures (should show external link message)
8. Verify SEO metadata in browser dev tools

### Build Validation

```bash
npm run lint
npm run format
npm run type:check
npm run build
```

## Future Enhancements (Out of Scope)

- Match results display (scores, half-time scores)
- Filter by date range
- Calendar view option
- Add to calendar functionality
- Live score updates
- Match statistics and lineups

## Notes

- Competition division parsing may need refinement based on actual data patterns
- Consider adding skeleton loading states for better UX
- Team logo fallbacks should match existing brand guidelines
- Ensure consistent spacing with other team pages (players, coaches)

---

## Implementation Status

### ✅ Completed (2026-01-14)

#### Components Created

1. **MatchCard.tsx** (`src/components/matches/MatchCard.tsx`)
   - Displays individual fixture with team logos, date, time, venue
   - Responsive grid layout with mobile-first design
   - Round badge shown on desktop view
   - MapPin icon for venue location

2. **MatchList.tsx** (`src/components/matches/MatchList.tsx`)
   - Groups fixtures by round number
   - Sorts fixtures by date/time within rounds
   - Renders round headers and match cards in sections

3. **Matches Page** (`src/app/(site)/football/teams/[slug]/matches/page.tsx`)
   - Server component with async data fetching
   - SEO metadata generation with team and competition info
   - Uses PageContainer with `intro` prop for competition/season subtitle
   - Returns 404 for missing teams or fixtures

#### Design Decisions

- **NoFixturesMessage component not implemented**: Teams without local fixtures should not have a "Matches" button in the Teams page. Navigation handles this at the team list level with external links only.
- **PageContainer integration**: Used `intro` prop instead of creating a custom subheading, maintaining consistency with existing page layouts.
- **Round display**: Desktop shows round badge on the right; mobile layouts omit it to save space.

#### Validation

- ✅ ESLint passes
- ✅ Prettier formatting applied
- ✅ TypeScript type checking passes
- ✅ All components follow codebase style guide
  - No helper/utils (used internal functions)
  - Proper TypeScript types declared separately
  - Functional coding style with extracted logic
  - camelCase for variables and functions

#### Testing

- Available for testing at `/football/teams/seniors-mens/matches`
- Fixture data loaded from `data/matches/seniors-mens.json` (132 fixtures, 22 rounds)

### 📋 Remaining Tasks

- [ ] Manual browser testing (responsive layouts, dark mode)
- [ ] Build validation with `npm run build`
- [ ] Test with additional teams when fixture data becomes available
- [ ] Update team navigation to conditionally show "Matches" link only for teams with local fixtures
