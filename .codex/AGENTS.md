# Tech Stack

- Next.js 16.1.6, React 19.2.4
- Sanity CMS 5.7.0: Always check latest documentation when implementing features
  - Project contains both the Sanity Studio under /studio path and the main website available from /(site)/ directory
- Tailwind CSS 4.x, DaisyUI 5.5.14 for components (navbar, buttons, dialog, forms)
- Lucide for icons
- Playwright 1.58.1 (E2E testing and web scraping)
- TanStack Query 5.90.20, React Hook Form 7.71.1

## Plan Mode

- Use docs/todo.md for organizing higher level features and tasks - keep this up to date when completing work
- Make plans extremely concise - sacrifice grammar for concision
- At end of each plan, list unresolved questions if any
- Create plans in docs/plans as markdown files and update when completing tasks

# Environment & Commands

- **IMPORTANT**: Dev server runs on port 3003 (not 3000): `npm run dev`
- Node version: 24.12.0 (managed by Volta)
- TypeScript path aliases: `@/*` (src), `@data/*` (data)
- Required env vars: see .env.example (Sanity, AWS SES, reCAPTCHA)
- Sanity Studio: separate at /studio path

## Key Commands (see package.json for full list)

- `npm run dev` - Dev server on port 3003
- `npm run test:e2e[:ui|:debug|:report]` - Playwright E2E tests
- `npm run crawl:[clubs|fixtures]` - Playwright-based web scraping
- `npm run sync:[clubs|fixtures]` - Sync scraped data to Sanity
- `npm run type:gen` - Regenerate Sanity types after schema changes

# Testing

- Framework: Playwright only (no unit test framework)
- Tests run against http://localhost:3003
- Run E2E tests: `npm run test:e2e`
- Run with UI mode: `npm run test:e2e:ui`
- Debug mode: `npm run test:e2e:debug`
- View report: `npm run test:e2e:report`

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

- After finishing code changes run:
  - `npm run lint`
  - `npm run format`
  - `npm run type:check`
- For larger change sets also ensure Next.js can build: `npm run build`
- E2E testing: `npm run test:e2e`
- Pre-commit hooks auto-run: Husky runs lint-staged (prettier + eslint)

# Git & PRs

- Branch naming: feat/_, fix/_, claude/\* (claude branches auto-generated)
- Main branch: main
- Pre-commit: Husky runs lint-staged (prettier + eslint)

# Dependency Management

- Ensure to find the latest version of a package before adding it
- Avoid using deprecated packages or APIs

# Plan Creation

- Store plans as markdown files in `docs/plans/`
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
- Run `npm run type:gen` after Sanity schema changes
- Prettier line width: 100 chars (not default 80)
