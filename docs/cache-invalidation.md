# Cache Invalidation

This document explains how the Williamstown SC website invalidates its cache.

## Overview

The website uses Next.js cache tags to refresh cached content on demand. When you update content in Sanity CMS, call the revalidation API endpoint to clear the cache for that content.

## API Endpoint

**URL:** `/api/revalidate`

**Method:** `POST`

**Headers:**

- `x-revalidate-secret`: Secret token for authentication (must match `REVALIDATE_SECRET` env var)

**Request Body:**

- `_type`: The content type to revalidate (e.g., `newsArticle`, `team`, `sponsor`, etc.)`

**Response:**

```json
{
	"revalidated": true,
	"contentType": "newsArticle",
	"timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage Examples

### Revalidate News Articles

```bash
curl -X POST http://localhost:3003/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: your-secret-token-here" \
  -d '{"_type": "newsArticle"}'
```

### Revalidate Teams

```bash
curl -X POST http://localhost:3003/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: your-secret-token-here" \
  -d '{"_type": "team"}'
```

### Revalidate Site Settings

```bash
curl -X POST http://localhost:3003/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: your-secret-token-here" \
  -d '{"_type": "siteSettings"}'
```

## Available Content Types

The following content types can be revalidated:

- `newsArticle` - News articles
- `team` - Team information
- `sponsor` - Sponsor information
- `program` - Programs
- `page` - Generic pages
- `committeePage` - Committee page
- `contactPage` - Contact page
- `siteSettings` - Site-wide settings
- Individual page types: `homePage`, `aboutPage`, `teamsPage`, etc.

## Security and Authentication

**IMPORTANT:** The `/api/revalidate` endpoint must be protected. Never expose it without authentication.

### Why Authentication Matters

Without authentication, anyone who finds this endpoint could:

- Trigger the cache to invalidate repeatedly and slow the site down
- Force constant regeneration of cached pages and overload the server
- Use the endpoint to run a denial-of-service attack

### Authentication Setup

The endpoint requires a secret token in the `x-revalidate-secret` header. This token must match the `REVALIDATE_SECRET` environment variable on your server.

#### Environment Configuration

**Development (.env.local):**

```bash
REVALIDATE_SECRET=your-secret-token-here
```

**Production (Vercel):**

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add `REVALIDATE_SECRET` with a secure random value
4. Use a strong, randomly generated secret (e.g., `openssl rand -base64 32`)

### Security Best Practices

1. **Use HTTPS in production** - Prevents the secret from leaking in transit
2. **Generate strong secrets** - Use a random value at least 32 characters long
3. **Rotate secrets periodically** - Change the token regularly
4. **Never commit secrets** - Keep `.env.local` in `.gitignore`
5. **Add a Sanity webhook signature** - For extra protection, verify Sanity's webhook signature

### Rate Limiting

For high-traffic production sites, add rate limiting to prevent abuse:

- Use Vercel Edge Config for distributed rate limiting
- Add rate limiting in middleware
- Limit Sanity webhook retries

## Integration with Sanity CMS

To automatically trigger cache invalidation when content is published in Sanity, set up a webhook in your Sanity project. See [Sanity's webhook documentation](https://www.sanity.io/docs/webhooks) for detailed setup instructions.

### Required Configuration

When creating your Sanity webhook, use these settings:

- **URL:** `https://your-domain.com/api/revalidate`
- **HTTP method:** POST
- **Custom Headers:**
  - `x-revalidate-secret`: Your secret token (must match your `REVALIDATE_SECRET` environment variable)

### How It Works

Our API reads the `_type` field from the Sanity webhook payload. You don't need extra headers — Sanity includes the full document in the webhook body by default.

**Optional:** Use a GROQ projection `{_type}` to keep the payload small.

## Testing

To test if the API is working, you can make a GET request:

```bash
curl http://localhost:3003/api/revalidate
```

This will return information about the endpoint:

```json
{
	"message": "Revalidation API is working",
	"endpoint": "/api/revalidate",
	"method": "POST",
	"expectedHeaders": {
		"x-revalidate-secret": "secret token for authentication"
	},
	"expectedBody": {
		"_type": "content type to revalidate (e.g., newsArticle, siteSettings, page, etc.)"
	}
}
```

## Implementation Details

### Cache Tags

Each content fetching function uses Next.js cache tags to identify cached content:

```typescript
const articles = await client.fetch<NewsArticle[]>(query, {}, { next: { tags: ['newsArticle'] } });
```

### Revalidation

When the `/api/revalidate` endpoint receives a POST request, it calls Next.js `revalidateTag()` with the `'max'` profile:

```typescript
revalidateTag(contentType, 'max');
```

This clears all cached data for that tag. Visitors keep seeing the cached page while the site fetches fresh data in the background (stale-while-revalidate).

## Benefits

- **On-demand updates:** Content changes show up right away, with no full rebuild
- **Improved performance:** Only the affected content type is invalidated, not the whole cache
- **Better user experience:** Visitors see fresh content with no manual cache clearing
- **Efficient caching:** Static generation speed, with dynamic content updates
