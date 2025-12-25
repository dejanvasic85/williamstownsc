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

---

Building community through soccer. Feedback and contributions are welcome!
