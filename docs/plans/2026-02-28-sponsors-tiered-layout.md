# Sponsors Tiered Layout

## Purpose

Redesign sponsors page to group sponsors by tier (sponsorType), with gold-bordered boxes, glow effect, tier labels, and configurable card detail level per tier. CTA section uses dynamic tier data from Sanity.

## Requirements

- Group sponsors by `sponsorType`, ordered by `sponsorType.order` (lower = first)
- Each tier group: gold-bordered box with subtle glow, tier label top-right
- Sponsor cards: logo, name, optional description, optional website link
- Card detail level (`cardSize`) configurable per sponsorType in Sanity CMS
- CTA section driven by sponsorType data (not hardcoded)
- Responsive, mobile-first, light/dark theme, a11y AA

## Files to Change

| File                                           | Action                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `src/sanity/schema/sponsorType.ts`             | Add `cardSize` field (large/medium/small)                         |
| `src/lib/content/sponsors.ts`                  | New types + `getSponsorsGroupedByTier()` + `getAllSponsorTypes()` |
| `src/lib/content/index.ts`                     | Export new types/functions                                        |
| `src/components/sponsors/SponsorCard.tsx`      | Rework: variant-based layout (featured/standard/compact)          |
| `src/components/sponsors/SponsorTierGroup.tsx` | **New** - tier group container                                    |
| `src/components/sponsors/index.ts`             | Export new component                                              |
| `src/app/(site)/sponsors/page.tsx`             | Restructure: tier groups + dynamic CTA                            |

## Tasks

- [x] 1. Add `cardSize` to `sponsorType` schema (`large` / `medium` / `small`, default `medium`)
- [x] 2. Run `npm run type:gen` to regenerate Sanity types
- [x] 3. Update `src/lib/content/sponsors.ts`:
  - Expand query to include `type->{ name, order, description, cardSize }`
  - Add `SponsorTier` type: `{ name, order, description?, cardSize, sponsors[] }`
  - Add `getSponsorsGroupedByTier()` - fetch, group by type, sort by type order
  - Add `getAllSponsorTypes()` - fetch all sponsorTypes (for CTA section)
- [x] 4. Export new types/functions from `src/lib/content/index.ts`
- [x] 5. Rework `SponsorCard.tsx`:
  - `variant` prop: `featured` (large: logo + name + description + website), `standard` (medium: logo + name + website), `compact` (small: logo + name)
  - Featured: horizontal layout (logo left, details right)
  - Standard/compact: vertical card (logo top, details below)
- [x] 6. Create `SponsorTierGroup.tsx`:
  - Gold border + glow: `border-2 border-secondary/30 shadow-[0_0_15px_color-mix(in_srgb,var(--color-secondary)_15%,transparent)]`
  - Tier label: `badge badge-secondary` absolute top-right
  - Responsive grid of SponsorCards: cols based on variant
- [x] 7. Restructure `sponsors/page.tsx`:
  - Use `getSponsorsGroupedByTier()` for main content
  - Use `getAllSponsorTypes()` for CTA section (replaces hardcoded cards)
- [x] 8. Export from `components/sponsors/index.ts`
- [x] 9. Verify: `npm run lint && npm run format && npm run type:check && npm run build`

## Styling Details

### Tier group box

```
relative rounded-xl border-2 border-secondary/30 p-6 md:p-8
shadow-[0_0_15px_color-mix(in_srgb,var(--color-secondary)_15%,transparent)]
```

### Tier label (top-right)

```html
<div class="absolute -top-3 right-4">
	<span class="badge badge-secondary font-semibold">Principal</span>
</div>
```

### Card grid per variant

- `featured` (large): `grid-cols-1 lg:grid-cols-2`, larger cards
- `standard` (medium): `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- `compact` (small): `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

### cardSize → variant mapping

| `sponsorType.cardSize` | SponsorCard variant |
| ---------------------- | ------------------- |
| `large`                | `featured`          |
| `medium`               | `standard`          |
| `small`                | `compact`           |
