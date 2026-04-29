# Environment & Commands

- **IMPORTANT**: Dev server runs on port 3003 (not 3000): `pnpm run dev`
- Node version: 24.12.0 (managed by Mise)
- TypeScript path aliases: `@/*` (src), `@data/*` (data)
- Required env vars: see .env.example (Sanity, AWS SES, reCAPTCHA)
- Sanity Studio: separate at /studio path

## Key Commands (see package.json for full list)

- `pnpm run dev` - Dev server on port 3003
- `pnpm run test:e2e[:ui|:debug|:report]` - Playwright E2E tests
- `pnpm run crawl:[clubs|fixtures]` - Playwright-based web scraping
- `pnpm run sync:[clubs|fixtures]` - Sync scraped data to Sanity
- `pnpm run type:gen` - Regenerate Sanity types after schema changes

# Testing

- Framework: Playwright only (no unit test framework)
- Tests run against http://localhost:3003
- Run E2E tests: `pnpm run test:e2e`
- Run with UI mode: `pnpm run test:e2e:ui`
- Debug mode: `pnpm run test:e2e:debug`
- View report: `pnpm run test:e2e:report`

# Technical Requirements

- SEO friendly titles, descriptions and meta tags for search performance
- Light and dark themes need to be considered
- Ensure website can be installed and used as a PWA
- Accessibility (a11y) AA compliant
- Responsive design (mobile-first)

# Code Style

- **NEVER** create "helpers" or "utils" - use services, mappers, transformers etc
- Always prefer alias imports over relative imports
- **MUST**: All Sanity CMS queries defined in `lib/content` modules, not inline in components or actions
- Follow DRY principle - extract repeated code into functions or constants
- **IMPORTANT**: Never duplicate code blocks or logic. If copying same pattern (nested ternaries, object transformations, processing logic) across multiple functions, IMMEDIATELY extract into a private helper function
- Prefer functional coding style: extract logic into small, named functions rather than inline code
- Use switch statements instead of long if/else chains when branching on a single value
- Never use SCREAMING_CASE for constants, always use camelCase instead (e.g. `contactTypes` not `CONTACT_TYPES`)
- Constant values that are objects should be suffixed with 'Value' (e.g. `defaultConfigValue`)
- Only write code comments when code is not clear and keep concise, avoid commenting out code
- Avoid magic numbers and strings, use constants instead
- Typescript files should be camelCase e.g. myService.ts
- Application env variables should be declared in config using a zod schema for validation

# React & Components

- Always use Next.js Image component `<Image />` instead of `<img />`
- Each Component should declare its own prop types using TypeScript within the same file
- **NEVER** use inline TypeScript types in function parameters - always declare a separate type or interface (e.g., `type MyProps = {...}` not `function MyComponent({ prop }: { prop: string })`)
- Component files should have constants declared outside the component function
- Avoid use of inline styles, prefer Tailwind CSS classes
- Event handlers should be named with the `handle` prefix (e.g. `handleClick`)
- Try to limit components and modules up to 200 lines and split into different components to manage complexity

# Workflow

All changes MUST follow the following workflow

- After finishing code changes and **before every push**, run all checks in order:
  1. `pnpm run format`
  2. `pnpm run lint`
  3. `pnpm run type:check`
  4. `pnpm run build`
  5. `pnpm run test:e2e`
- Never push without running these checks — commit any formatting changes before pushing
- Pre-commit hooks auto-run: Husky runs lint-staged (prettier + eslint)
- Update any plan files with progress to help with issue tracking

# Dependency Management

- Ensure to find the latest version of a package before adding it
- Avoid using deprecated packages or APIs

# Plan Creation

- Store plans as markdown files in `docs/plans/`
- File naming: `YYYY-MM-DD-description.md` (e.g. `2026-02-26-homepage-sponsors-layout.md`)
- Use docs/todo.md for organizing higher level features and tasks - keep this up to date when completing work
- Make plans extremely concise - sacrifice grammar for concision
- At end of each plan, list unresolved questions if any
- Update plans when completing tasks
- Each plan must include:
  - Purpose: clarify the intended outcome and scope
  - Requirements: list constraints, dependencies, and acceptance criteria
  - Todo list: ordered, actionable tasks (checkboxes encouraged) with owners/status when known

# Important Notes

- **IMPORTANT**: Dev server port 3003 (affects Playwright config & testing)
- **MUST**: Sanity queries MUST be in lib/content modules, not inline
- **NEVER**: create "helpers" or "utils" (use services/mappers/transformers)
- Playwright-based web scraping: crawl scripts use playwright-core for data extraction
- Pre-commit hooks auto-run: changes will trigger prettier + eslint
- Run `pnpm run type:gen` after Sanity schema changes
- Prettier line width: 100 chars (not default 80)
