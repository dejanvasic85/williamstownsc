# Cache Invalidation

This document explains the cache invalidation strategy implemented for the Williamstown SC website.

## Overview

The website uses Next.js cache tags to enable on-demand revalidation of cached content. When content is updated in Sanity CMS, you can trigger cache invalidation by calling the revalidation API endpoint.

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

**IMPORTANT:** The `/api/revalidate` endpoint **must be protected** and should not be exposed without authentication.

### Why Authentication is Critical

Without proper authentication, anyone who discovers your revalidation endpoint could:

- Repeatedly trigger cache invalidation, degrading performance
- Cause unnecessary server load by forcing constant regeneration of cached pages
- Use the endpoint as a denial-of-service vector

### Authentication Setup

The endpoint requires a secret token to be passed in the `x-revalidate-secret` header. This token must match the `REVALIDATE_SECRET` environment variable configured on your server.

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

1. **Use HTTPS in production** - All API calls should use HTTPS to prevent secret exposure in transit
2. **Generate strong secrets** - Use cryptographically secure random values, minimum 32 characters
3. **Rotate secrets periodically** - Update the secret token regularly as part of security maintenance
4. **Never commit secrets** - Keep `.env.local` in `.gitignore`, never commit secrets to version control
5. **Sanity webhook signature** - For Sanity CMS webhooks, consider using Sanity's webhook signature verification as an additional security layer

### Rate Limiting Consideration

For production deployments with high traffic, consider implementing rate limiting to prevent abuse:

- Use Vercel Edge Config for distributed rate limiting
- Implement middleware-based rate limiting
- Configure Sanity webhook retry limits to prevent excessive calls

## Integration with Sanity CMS

To automatically trigger cache invalidation when content is published in Sanity, set up a webhook in your Sanity project. See [Sanity's webhook documentation](https://www.sanity.io/docs/webhooks) for detailed setup instructions.

### Required Configuration

When creating your Sanity webhook, use these settings:

- **URL:** `https://your-domain.com/api/revalidate`
- **HTTP method:** POST
- **Custom Headers:**
  - `x-revalidate-secret`: Your secret token (must match your `REVALIDATE_SECRET` environment variable)

### How It Works

Our API automatically extracts the `_type` field from the Sanity webhook payload. You don't need to set any additional headers - Sanity includes the full document data in the webhook body by default.

**Optional:** Use a GROQ projection `{_type}` to reduce payload size if desired.

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

This invalidates all cached data associated with that tag using stale-while-revalidate semantics, serving cached content while fetching fresh data in the background.

## Benefits

- **On-demand updates:** Content updates are reflected immediately without waiting for full rebuilds
- **Improved performance:** Only invalidate specific content types instead of entire cache
- **Better user experience:** Users see fresh content without manual cache clearing
- **Efficient caching:** Combine the benefits of static generation with dynamic content updates
