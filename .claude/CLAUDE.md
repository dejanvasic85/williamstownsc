# Tech stack

- Nextjs: Always check latest documentation when implementing features. You can use Tools like Nextjs MCP Tools
- Sanity CMS
- Tailwind CSS V4
- DaisyUI use 

# Technical requirements

- Accessibility (a11y) AA compliant
- Responsive design (mobile-first)
- Clean and maintainable code with re-usable Components

# Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Each Component should declare its own prop types using TypeScript within the same file
- Component files should have constants declared outside the component function
- Use camelCase for variable and function names
- Use PascalCase for React component file names
- Avoid use of inline styles, prefer Tailwind CSS classes
- Avoid using `any` type in Typescript or casting with `as`
- Declare constant values and objects using `const`
- Constant values that are objects, do not use CAPS for the variable name, use camelCase instead suffixed with 'Value'
- Event handlers should be named with the `handle` prefix (e.g. `handleClick`)
- Only write code comments when the code is not clear and keep it conscise, avoid commenting out code
- Avoid magic numbers and strings, use constants instead
- Each file should have line break at the end
- Try to limit components and modules up to 200 lines and split in to different components to manage complexity
- Typescript files should be camelCase e.g. myService.ts

# Workflow

- Be sure to run unit tests when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for example `npm run test -- Button.tsx`
- Use `npm run format` whenever the format is not correct

# Dependency management

- Ensure to find the latest version of a package before adding it
- Avoid using deprecated packages or APIs
