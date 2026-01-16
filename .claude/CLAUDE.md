# Tech stack

- Nextjs: Always check latest documentation when implementing features. You can use Tools like Nextjs MCP Tools
  - The project contains both the sanity study under /studio path and the main website available from /(site)/ directory
- Sanity CMS
- Tailwind CSS V4
- DaisyUI for components like navbar, buttons, dialog and forms
- Lucide for icons

## Plan Mode

- We use docs/todo.md for organising higher level features and tasks so we should keep this up to date when we complete work.
- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
- Create plans in docs/plans as markdown files and ensure to update when completing tasks.

# Technical requirements

- SEO friendly titles, descriptions and meta tags for search performance
- Light and dark themes need to be considered
- Ensure that this website can be installed and used as a PWA
- Accessibility (a11y) AA compliant
- Responsive design (mobile-first)
- Clean and maintainable code with re-usable Components

# Code style

- Never create "helpers" or "utils" instead use services, mappers, transformers etc
- Always prefer alias imports over relative imports
- All Sanity CMS queries should be defined in `lib/content` modules, not inline in components or actions
- Always use Nextjs Image component `<Image />` instead of `<img />`
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Do not re-export modules unless it's a barrel file (index.ts)
- Follow DRY (Don't Repeat Yourself) principle - extract repeated code into functions or constants
- **IMPORTANT**: Never duplicate code blocks or logic. If you find yourself copying the same pattern (like nested ternaries, object transformations, or processing logic) across multiple functions, IMMEDIATELY extract it into a private helper function.
- Prefer functional coding style: extract logic into small, named functions rather than inline code
- Use switch statements instead of long if/else chains when branching on a single value
- Each Component should declare its own prop types using TypeScript within the same file
- Never use inline TypeScript types in function parameters - always declare a separate type or interface (e.g., `type MyProps = {...}` not `function MyComponent({ prop }: { prop: string })`)
- Component files should have constants declared outside the component function
- Use camelCase for variable and function names
- Use PascalCase for React component file names
- Avoid use of inline styles, prefer Tailwind CSS classes
- Avoid using `any` type in Typescript or casting with `as`
- Declare constant values and objects using `const`
- Never use SCREAMING_CASE for constants, always use camelCase instead (e.g. `contactTypes` not `CONTACT_TYPES`)
- Constant values that are objects should be suffixed with 'Value' (e.g. `defaultConfigValue`)
- Event handlers should be named with the `handle` prefix (e.g. `handleClick`)
- Only write code comments when the code is not clear and keep it conscise, avoid commenting out code
- Avoid magic numbers and strings, use constants instead
- Each file should have line break at the end
- Try to limit components and modules up to 200 lines and split in to different components to manage complexity
- Typescript files should be camelCase e.g. myService.ts
- Application env variables should be declared in config using a zod schema for validation

# Workflow

- After finishing code changes run:
  - `npm run lint`
  - `npm run format`
  - `npm run type:check`
- For larger change sets also ensure Next.js can build: `npm run build`
- Prefer running targeted unit tests when relevant, e.g. `npm run test -- Button.tsx`

# Dependency management

- Ensure to find the latest version of a package before adding it
- Avoid using deprecated packages or APIs

# Plan creation

- Store plans as markdown files in `docs/plans/`.
- Each plan must include:
  - Purpose: clarify the intended outcome and scope.
  - Requirements: list constraints, dependencies, and acceptance criteria.
  - Todo list: ordered, actionable tasks (checkboxes encouraged) with owners/status when known.
