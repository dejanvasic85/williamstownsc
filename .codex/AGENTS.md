# Project Rules (Codex)

## Stack (fixed)
- Next.js 16.x (App Router), React 19
- Sanity CMS 5.x (Studio at /studio, site at /(site))
- Tailwind CSS 4.x, DaisyUI 5.x
- Playwright only (no unit tests)
- TanStack Query v5, React Hook Form v7

## Environment
- Dev server ALWAYS runs on port 3003
- Node 24.12.0 (Volta)
- Aliases: @/* (src), @data/* (data)
- Env vars defined via zod config (see .env.example)

## Absolute Code Rules
- NEVER create helpers or utils (use services, mappers, transformers)
- NEVER duplicate logic — extract immediately
- Sanity queries ONLY in lib/content modules
- Prefer alias imports over relative imports
- Use switch over long if/else chains
- No SCREAMING_CASE constants
- Object constants end with Value

## React Rules
- Always use Next.js <Image />
- No inline TS types in function params
- Declare prop types in same file
- Constants outside component
- No inline styles (Tailwind only)
- Event handlers prefixed with handle
- Split files >200 LOC

## Workflow
- After changes: lint, format, type:check
- For large changes: build + test:e2e
- Run type:gen after Sanity schema changes

## Testing
- Playwright against http://localhost:3003 only

## Planning
- Plans go in docs/plans/*.md
- Include: Purpose, Requirements, Todo
