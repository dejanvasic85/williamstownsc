# Policy Documents

**Created:** 2026-02-13

## Purpose

Populate the empty Policies & Regulations page with downloadable policy documents (PDFs). Content authors upload files via Sanity Studio; visitors browse documents grouped by category and download them.

## Approach

Use Sanity's `file` type for PDF uploads. Create a `policyDocument` content type with metadata (title, category, description, effective date). The existing `policiesPage` singleton handles page-level intro text and SEO. Documents render grouped by category with download links.

**Why files over HTML conversion:**

- Policy docs are formal/governance — PDFs are the expected format
- Some docs are federation-owned (FV) — club just hosts them, not authors them
- Simpler workflow: committee produces PDF -> author uploads -> visitors download

## Requirements

- Content authors can upload PDF files in Sanity Studio
- Each document has: title, category, file, optional description, optional effective date
- Categories group documents on the page (e.g. "Club Policies", "Football Victoria", "By-Laws")
- Category is a simple string list (not a separate document type — not enough complexity to warrant one)
- Page shows intro text (from existing `policiesPage`) then documents grouped by category
- Each document shows title, description, effective date, file size, and a download link
- Documents are ordered within categories by an `order` field
- Accessible, responsive, works in light/dark themes

## Implementation Tasks

- [x] Create `policyDocument` schema in `src/sanity/schema/policyDocument.ts`
  - `title` (string, required)
  - `category` (string, required, predefined list: "Club Policies", "Football Victoria Policies", "By-Laws & Constitutions")
  - `file` (file, required, accept only PDF)
  - `description` (text, optional, short summary)
  - `effectiveDate` (date, optional)
  - `order` (number, for sorting within category)
  - `published` (boolean, default true, controls visibility on the site)
  - Preview: show title + category
- [x] Register schema in `src/sanity/schema/index.ts`
- [x] Add `policyDocument` to Sanity Studio structure in `src/sanity/structure.ts`
  - Add as content type (will auto-appear via `documentTypeListItems` filter)
  - Or add dedicated section if preferred
- [x] Run `npm run type:gen` to regenerate Sanity types
- [x] Create content query module `src/lib/content/policyDocuments.ts`
  - GROQ query fetching policy documents where `published == true`, with file URL + metadata
  - Transform/group by category, sorted by order within each category
  - Export types for the grouped result
- [x] Update `src/app/(site)/club/policies-and-regulations/page.tsx`
  - Fetch page data (intro) + policy documents
  - Render intro section from `policiesPage`
  - Render document groups by category
  - Each group: category heading, then list of documents
  - Each document: title, description, effective date, file size badge, download button/link
  - Use DaisyUI components (cards or list items)
  - Download link uses `<a href={url} download>` pattern with appropriate icon (lucide `FileDown` or `Download`)
- [x] Run `npm run lint && npm run format && npm run type:check`
- [x] Run `npm run build` to verify
- [x] Commit and push

## File Changes

| File                                                    | Action                              |
| ------------------------------------------------------- | ----------------------------------- |
| `src/sanity/schema/policyDocument.ts`                   | Create                              |
| `src/sanity/schema/index.ts`                            | Edit - register new schema          |
| `src/sanity/structure.ts`                               | Edit - add to filter list if needed |
| `src/lib/content/policyDocuments.ts`                    | Create                              |
| `src/app/(site)/club/policies-and-regulations/page.tsx` | Edit - render documents             |

## UI Design Notes

- Group documents under category headings (H2)
- Each document as a row/card with: icon, title, description, date, download button
- File size shown as badge (e.g. "PDF 1.2 MB") if available from Sanity asset metadata
- Mobile: stack vertically. Desktop: can use a subtle table or card list
- Empty state: show message if no documents uploaded yet

## Unresolved Questions

- Are the three proposed categories ("Club Policies", "Football Victoria Policies", "By-Laws & Constitutions") correct, or are there others? Can adjust the string list later.
