# Social Media Publishing on Article Publish

**Date**: 2026-01-30
**Status**: Planning

## Purpose

Auto-publish a post to Facebook Page and Instagram Business account when a news article is published in Sanity CMS. Post includes featured image, excerpt text, and link back to the article.

## Architecture

```
Sanity CMS (publish newsArticle)
  └── webhook POST /api/social-publish
        ├── Validate webhook secret
        ├── Fetch article (slug, title, excerpt, featuredImage)
        ├── Build public image URL (Sanity CDN, 1200x630)
        ├── Construct caption (excerpt + link + hashtags)
        ├── POST Facebook Page photo with caption
        └── POST Instagram container → publish
```

### Flow

1. Editor publishes `newsArticle` in Sanity
2. Sanity webhook fires to `/api/social-publish` with document payload (`_id`, `_type`, `slug`)
3. Route validates secret, rejects non-`newsArticle` types
4. Fetches full article via existing content query (or new query by `_id`)
5. Builds image URL: `urlFor(image).width(1200).height(630).url()` (public, JPEG)
6. Constructs caption: `{title}\n\n{excerpt}\n\nRead more: {articleUrl}`
7. Publishes to Facebook (single API call) and Instagram (two-step container flow)
8. Returns per-platform success/failure JSON

## Meta Graph API Summary

### Authentication

- Create **Meta Developer App** (Business type) at developers.facebook.com
- Use **System User token** from Meta Business Manager (never expires, server-to-server)
- Get **Page Access Token** via `GET /me/accounts` (never expires from system user)
- Get **Instagram Business Account ID** via `GET /{page-id}?fields=instagram_business_account`

### Permissions (need App Review for production)

| Permission                  | Platform  | Purpose                |
| --------------------------- | --------- | ---------------------- |
| `pages_show_list`           | Facebook  | List managed pages     |
| `pages_read_engagement`     | Facebook  | Required with manage   |
| `pages_manage_posts`        | Facebook  | Create page posts      |
| `instagram_basic`           | Instagram | Profile access         |
| `instagram_content_publish` | Instagram | Publish content        |

Dev mode may suffice if only club admins (added as app testers) trigger publishing.

### Facebook -- Photo post with link in caption

```
POST /v22.0/{page-id}/photos
{ "caption": "...", "url": "{imageUrl}", "published": true, "access_token": "{token}" }
→ { "id": "photo_id", "post_id": "page_post_id" }
```

### Instagram -- Two-step container flow

```
// Step 1: Create container
POST /v22.0/{ig-user-id}/media
{ "image_url": "{imageUrl}", "caption": "...", "access_token": "{token}" }
→ { "id": "container_id" }

// Step 2: Poll status until FINISHED, then publish
POST /v22.0/{ig-user-id}/media_publish
{ "creation_id": "{containerId}", "access_token": "{token}" }
→ { "id": "media_id" }
```

### Constraints

- Instagram: JPEG only, public URL, max 2200 char caption, max 30 hashtags
- Instagram: max 25 API-published posts per 24h rolling window
- Facebook: ~200 API calls per user per hour
- Sanity CDN image URLs are publicly accessible -- works directly with Meta APIs

## Environment Variables

Add `metaConfigSchema` to `lib/config.ts`:

| Variable                     | Description                                    |
| ---------------------------- | ---------------------------------------------- |
| `META_ACCESS_TOKEN`          | Page access token (system user, never expires)  |
| `META_FACEBOOK_PAGE_ID`      | Facebook Page ID                                |
| `META_INSTAGRAM_ACCOUNT_ID`  | Instagram Business Account ID                   |
| `SOCIAL_PUBLISH_SECRET`      | Webhook secret for `/api/social-publish`        |
| `NEXT_PUBLIC_SITE_URL`       | Base URL for constructing article links         |

## Key Decisions

- **Direct `fetch`** over `facebook-nodejs-business-sdk` -- SDK is marketing-API-focused, overkill for simple posting
- **Dedicated route** `/api/social-publish` separate from `/api/revalidate` -- different concern, secret, error handling
- **Per-platform graceful failure** -- if Facebook fails, still attempt Instagram and vice versa
- **Sanity image pipeline** for public JPEG URLs at OG-card dimensions (1200x630)

## Requirements

- Webhook secret validation (same pattern as `/api/revalidate`)
- Only trigger on `newsArticle` type
- Only on publish, not drafts -- Sanity webhook filter: `!(_id in path("drafts.**"))`
- Article URL from `routes.newsArticle(slug)` prefixed with `NEXT_PUBLIC_SITE_URL`
- Zod validation for webhook payload and config
- Structured error logging (no silent failures)

## Todo

### Infrastructure (manual / one-time)

- [ ] Create Meta Developer App, configure permissions, obtain system user token
- [ ] Get Facebook Page ID and Instagram Business Account ID
- [ ] Configure Sanity webhook to POST `/api/social-publish` on `newsArticle` publish (filter: non-draft)
- [ ] Submit for Meta App Review if needed (or use dev mode with admin testers)

### Code

- [ ] Add `metaConfigSchema` + `getMetaConfig()` to `lib/config.ts`
- [ ] Add `NEXT_PUBLIC_SITE_URL` to client config schema
- [ ] Update `.env.example` with new env vars
- [ ] Create `lib/services/socialPublishService.ts` -- `publishToFacebook()`, `publishToInstagram()`, `publishArticleToSocials()`
- [ ] Add `getArticleForSocialPublish(id)` query to `lib/content/news.ts` (title, slug, excerpt, featuredImage)
- [ ] Create `app/api/social-publish/route.ts` -- webhook validation, fetch article, orchestrate publish
- [ ] Unit tests for service functions (mocked fetch) and route handler (mocked service)
- [ ] Lint, format, type-check
- [ ] Manual e2e test: publish article in Sanity → verify posts on Facebook + Instagram

## Key Files

| File                                       | Purpose                                |
| ------------------------------------------ | -------------------------------------- |
| `src/lib/config.ts`                        | Add `metaConfigSchema`                 |
| `src/lib/services/socialPublishService.ts` | Facebook + Instagram publish functions |
| `src/lib/content/news.ts`                  | Add social-publish article query       |
| `src/app/api/social-publish/route.ts`      | Webhook handler API route              |
| `.env.example`                             | Document new env vars                  |

## Unresolved Questions

1. **Post template** -- specific format/tone? Include club name, hashtags like `#WilliamstownSC #GoSeagulls`?
2. **Opt-out per article** -- add a boolean toggle to `newsArticle` schema to skip social publishing?
3. **Retry strategy** -- on Meta API failure, retry with backoff? Queue? Or log and move on?
4. **Carousel support** -- single featured image for now; support multiple content images later?
5. **Site base URL** -- is there a canonical domain configured, or add `NEXT_PUBLIC_SITE_URL`?
