<h1 align="center">Williamstown SC – Soccer Club Website</h1>

<p align="center">
  A modern soccer club website built with Next.js and Sanity CMS, showcasing teams, programs, and club news.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tooling"><strong>Tooling</strong></a> ·
  <a href="#developing-and-running-locally"><strong>Developing and Running Locally</strong></a>
</p>
<br/>

## Features

- Modern, responsive design with mobile-first approach
- Content management powered by Sanity CMS
- Blog/news posts with rich text content and images
- Team and program information pages
- Fixtures and scheduling
- AA-compliant accessibility (a11y)
- SEO-friendly architecture
- Type-safe development with TypeScript
- Code quality tooling with ESLint, Prettier, and Husky
- Deployed on Vercel for fast, global delivery

## Tooling

- **Next.js 16**: React framework for production-grade applications
- **Sanity CMS**: Headless CMS for flexible content management
- **Tailwind CSS V4**: Utility-first CSS framework
- **DaisyUI**: Tailwind CSS component library
- **TypeScript**: Type-safe development
- **Zod**: Schema validation for environment variables
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Husky**: Git hooks for code quality
- **Vercel**: Hosting and deployment

## Why We Built This

This website serves as the digital home for Williamstown Soccer Club, providing a platform to share information about our teams, programs, and community. Built with modern web technologies, it ensures a fast, accessible, and maintainable solution that can grow with the club's needs.

## Developing and Running Locally

To run the site locally, follow these steps:

### Prerequisites

- Node.js 18+ installed
- A Sanity account and project set up

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```bash
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
```

You can find your Sanity project ID in your [Sanity project settings](https://www.sanity.io/manage).

### 3. Run the development server

```bash
npm run dev
```

The site will be available at [http://localhost:3003](http://localhost:3003)

### 4. Access Sanity Studio

The Sanity Studio is available at [http://localhost:3003/studio](http://localhost:3003/studio) where you can manage content.

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type:check` - Run TypeScript type checking
- `npm run sanity:typegen` - Generate TypeScript types from Sanity schemas
- `npm run sanity:deploy` - Deploy Sanity Studio
- `npm run sanity:build` - Build Sanity Studio

## Deploying

The site is deployed on Vercel. To deploy your own version:

1. Connect your GitHub repository to Vercel
2. Set up the required environment variables in Vercel:
   - `SANITY_PROJECT_ID`
   - `SANITY_DATASET`
   - `SANITY_API_VERSION` (optional, defaults to 2024-01-01)
3. Deploy!

## Content Management

### Creating Blog Posts

1. Navigate to [http://localhost:3003/studio](http://localhost:3003/studio)
2. Click on "Post" in the sidebar
3. Create a new post with:
   - Title
   - Slug (auto-generated from title)
   - Excerpt
   - Main image with alt text
   - Publication date
   - Rich text body content

### Updating Schemas

After modifying Sanity schemas in `src/sanity/schema/`, run:

```bash
npm run sanity:typegen
```

This will update the TypeScript types to match your schema changes.

## Code Style Guidelines

- Use ES modules (import/export) syntax
- Destructure imports when possible
- Use TypeScript for type safety (avoid `any` types)
- Follow mobile-first responsive design principles
- Use Tailwind CSS classes instead of inline styles
- Use camelCase for variables and functions, PascalCase for components
- Event handlers should use the `handle` prefix (e.g., `handleClick`)
- Limit components to ~200 lines; split into smaller components as needed

---

Building community through soccer. Feedback and contributions are welcome!
