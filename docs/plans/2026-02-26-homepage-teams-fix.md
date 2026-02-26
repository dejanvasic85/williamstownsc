# Homepage Teams Section Fix

## Purpose

Fix bug where teams without photos render as empty cards in the FootballSection. Add `showOnHomepage` boolean to Team schema so editors can control which teams appear on the homepage instead of hardcoding "seniors" filter.

## Requirements

- Teams without photos show `TeamPhotoPlaceholder` instead of empty card
- New `showOnHomepage` boolean field on Team schema (default false)
- Query filters by `showOnHomepage == true` instead of `ageGroup == "seniors"`
- If no teams returned, hide the entire Senior Teams subsection
- Run `npm run type:gen` after schema changeˆ

## Tasks

### 1. Add `showOnHomepage` field to Team schema

**File:** `src/sanity/schema/team.ts`

- Add boolean field `showOnHomepage` after `order` field
- Title: "Show on homepage", description: "Display this team in the homepage Football section"
- Default: false, not required

### 2. Update the GROQ query

**File:** `src/lib/content/seniorTeams.ts`

- Rename file to `homepageTeams.ts` (or keep and rename export)
- Change filter: `ageGroup == "seniors"` -> `showOnHomepage == true`
- Keep `order(order asc)` sorting, remove `[0...2]` limit (let editors control via toggle)

### 3. Fix FootballSection to handle missing photos

**File:** `src/components/home/FootballSection.tsx`

- Import `TeamPhotoPlaceholder` from `@/components/teams/TeamPhotoPlaceholder`
- Add else branch when `team.photo?.asset?.url` is falsy — render placeholder with team name/description overlay
- Update import from `seniorTeams` -> `homepageTeams` (if renamed)
- Update `SeniorTeam` interface and `getSeniorTeams` function naming to reflect "homepage teams"
- The `seniorTeams.length > 0` check already hides the section when empty

### 4. Regenerate types

- Run `npm run type:gen`

## Verification

- `npm run type:check`
- `npm run lint && npm run format`
- `npm run build`
- Visual check: dev server on port 3003, verify homepage shows placeholder for teams without photos
- Toggle `showOnHomepage` in Sanity Studio, confirm teams appear/disappear
