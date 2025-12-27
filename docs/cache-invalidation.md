# Cache Invalidation

This document explains the cache invalidation strategy implemented for the Williamstown SC website.

## Overview

The website uses Next.js cache tags to enable on-demand revalidation of cached content. When content is updated in Sanity CMS, you can trigger cache invalidation by calling the revalidation API endpoint.

## API Endpoint

**URL:** `/api/revalidate`

**Method:** `POST`

**Headers:**

- `x-content-type`: The content type to revalidate (e.g., `newsArticle`, `team`, `sponsor`, etc.)

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
  -H "x-content-type: newsArticle"
```

### Revalidate Teams

```bash
curl -X POST http://localhost:3003/api/revalidate \
  -H "x-content-type: team"
```

### Revalidate Site Settings

```bash
curl -X POST http://localhost:3003/api/revalidate \
  -H "x-content-type: siteSettings"
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

## Integration with Sanity CMS

To automatically trigger cache invalidation when content is published in Sanity, you can set up a webhook:

1. Go to your Sanity project dashboard
2. Navigate to **API** → **Webhooks**
3. Create a new webhook with the following settings:
   - **URL:** `https://your-domain.com/api/revalidate`
   - **Trigger on:** Document changes
   - **HTTP method:** POST
   - **Headers:** Add `x-content-type` header with the appropriate content type

### Webhook Configuration Example

For a more dynamic approach, you can use Sanity's webhook projection to extract the content type:

```json
{
	"url": "https://your-domain.com/api/revalidate",
	"method": "POST",
	"headers": {
		"x-content-type": "{{ _type }}"
	}
}
```

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
		"x-content-type": "content type to revalidate (e.g., newsArticle, siteSettings, page, etc.)"
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

When the `/api/revalidate` endpoint receives a POST request, it calls Next.js `revalidateTag()`:

```typescript
revalidateTag(contentType);
```

This invalidates all cached data associated with that tag, forcing Next.js to fetch fresh data on the next request.

## Benefits

- **On-demand updates:** Content updates are reflected immediately without waiting for full rebuilds
- **Improved performance:** Only invalidate specific content types instead of entire cache
- **Better user experience:** Users see fresh content without manual cache clearing
- **Efficient caching:** Combine the benefits of static generation with dynamic content updates
