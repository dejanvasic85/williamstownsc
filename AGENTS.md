# Environment & Commands

- **IMPORTANT**: Dev server runs on port 3003 (not 3000)
- Node version pinned in `.nvmrc` / `package.json` engines (24.12.0)
- TypeScript path aliases: `@/*` (src), `@data/*` (data)
- Required env vars: see .env.example (Sanity, AWS SES, reCAPTCHA)
- Sanity Studio: separate at /studio path
- Prettier line width: 100 chars (not default 80)

## Key Commands (see package.json for full list)

- `pnpm run dev` - Dev server on port 3003
- `pnpm run test:e2e[:ui|:debug|:report]` - Playwright E2E tests
- `pnpm run type:gen` - Regenerate Sanity types after schema changes

# Testing

- Framework: Playwright only (no unit test framework)
- Tests run against http://localhost:3003

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
- **MUST**: All `<Image />` components that render external URLs (club logos, fixture images) MUST include `unoptimized` prop to avoid Vercel image transformation charges
- **MUST**: All `<Image />` components that render Sanity CDN images MUST use `loader={sanityImageLoader}` from `@/lib/sanityImageLoader` — never rely on Next.js to transform Sanity images
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
  5. `pnpm run test:e2e` only when there are changes to the application
  6. Run /caveman-review skill and address issues that you agree are worth fixing
- Never push without running these checks — commit any formatting changes before pushing
- Pre-commit hooks auto-run: Husky runs lint-staged (prettier + eslint)
- Update any plan files with progress to help with issue tracking

# Dependency Management

- Ensure to find the latest version of a package before adding it
- Avoid using deprecated packages or APIs

# Communication

- All writing shown to a person — chat responses, code comments, commit messages, PR descriptions — MUST follow ISO 24495-1:2023 plain language principles: use common words, keep sentences short and direct, put the main point first, avoid jargon and nominalizations (prefer "decide" over "make a decision"), organize content so the reader finds what they need on first read
- This applies only to human-facing writing, not to internal reasoning/thinking or code logic itself

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
