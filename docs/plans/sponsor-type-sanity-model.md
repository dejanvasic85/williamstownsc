# Sponsor Type Sanity Model

## Purpose

Convert hardcoded sponsor types (Principal, Major, Community Partner) to a manageable Sanity content model allowing authors to add/edit sponsor types dynamically.

## Requirements

- Create new `sponsorType` document schema
- Update `sponsor` schema to reference `sponsorType` instead of hardcoded string list
- Maintain existing functionality (display, ordering, queries)
- No breaking changes to existing sponsors (migration handled by author)
- Keep sponsor type display in UI (badge on sponsors page)

## Implementation Tasks

- [x] Create `sponsorType` schema in `/src/sanity/schema/sponsorType.ts`
  - Fields: `name` (string, required), `order` (number), `description` (text)
  - Preview showing name
- [x] Register `sponsorType` in schema index
- [x] Update `sponsor` schema field from hardcoded list to reference field
  - Change type from `string` with options to `reference` to `sponsorType`
  - Update validation
- [x] Update TypeScript types and queries in `/src/lib/content/sponsors.ts`
  - Adjust transformer to handle reference field
  - Update GROQ queries to expand sponsorType reference
- [x] Test Sanity Studio loads without errors
- [x] Run linting, formatting, type checking

## Notes

- Existing sponsors will need sponsor type reassignment in Studio after deployment
- Hardcoded sponsor type descriptions on sponsors page (lines 96-124) remain unchanged for now
- Consider adding sponsor type color/badge variant field in future iteration
