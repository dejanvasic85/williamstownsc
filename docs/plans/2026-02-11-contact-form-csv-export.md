# Contact Form Submissions CSV Export

**Created:** 2026-02-11
**Status:** ✅ Complete

## Purpose

Allow Sanity Studio users to export contact form submissions as CSV for sharing with others (e.g. committee members without Sanity access). Data contains PII so access is restricted to authenticated Studio users only.

## Approach

Custom Sanity Studio tool plugin using `definePlugin` + `tools` API. Renders a React component inside Studio with filtering controls and a download button. No new API routes or auth layers needed — leverages Sanity's existing authentication.

## Requirements

- Export formSubmission documents as CSV from within Sanity Studio
- Filter by contact type, status, and date range before export
- Clean column headers (not raw field names)
- Exclude metadata (IP, user agent) from default export for privacy
- No external dependencies — use native CSV generation (simple data, no special chars that need a library)
- Only accessible to authenticated Sanity Studio users

## Todo

- [x] Create plan
- [x] Create `src/sanity/plugins/csvExport/` with tool component
- [x] Register plugin in `sanity.config.ts`
- [x] Run lint, format, type-check
- [x] Commit and push

## Technical Design

### Files

- `src/sanity/plugins/csvExport/csvExportTool.tsx` — React component with filters + download
- `src/sanity/plugins/csvExport/index.ts` — `definePlugin` wrapper
- `src/sanity/plugins/csvExport/csvSerializer.ts` — CSV generation logic

### CSV Columns

Common: Submitted At, Contact Type, Status, Name, Email, Phone, Message
Player: Age Group, Experience, Position
Coach: Qualifications, Coaching Experience, Age Groups Interest
Sponsor: Organization, Sponsorship Tier
Program: Program ID
General: Subject

### UI

- Filters: contact type dropdown, status dropdown, date range (from/to)
- "Export CSV" button triggers GROQ fetch + browser download
- Uses `@sanity/ui` components (Card, Stack, Select, Button, TextInput)
- Uses `useClient` hook to query Sanity from within Studio
