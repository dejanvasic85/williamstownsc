# Move Sponsors Section to Dedicated Row on Homepage

## Purpose

The homepage has a 3-column grid (Next Match | Sponsors | Key Dates). The sponsors section with multiple logos forces the row to be very tall, and the logos appear cramped in the narrow column. Moving sponsors to its own full-width row below gives them more space and lets Next Match and Key Dates be shorter.

## Requirements

- Sponsors get a dedicated full-width row below Next Match / Key Dates
- Next Match and Key Dates become a 2-column layout
- Sponsor logos use flex wrap with even spacing
- Mobile: all sections stack vertically (no change)
- Keep existing card styling (border, rounded, bg-surface)

## Tasks

- [x] **`src/app/(site)/page.tsx`** (~lines 91-101)
  - Change grid from `lg:grid-cols-3` → remove (keep `md:grid-cols-2`)
  - Move `<SponsorsSection>` outside the grid into its own `<div className="mt-12">`

- [x] **`src/components/home/SponsorsSection.tsx`**
  - Adjust layout for full width: header+button top row, logos spread with `justify-evenly`
  - Keep same card styling

## Verification

- `npm run dev` → check homepage at localhost:3003
- Desktop: Next Match and Key Dates side-by-side, sponsors full-width below
- Mobile: all sections stack vertically
- `npm run lint && npm run format && npm run type:check`
