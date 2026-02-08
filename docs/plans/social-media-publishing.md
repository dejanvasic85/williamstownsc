# Social Media Publishing on Article Publish

**Date**: 2026-01-30
**Status**: Planning

## Purpose

Auto-publish a post to Facebook Page and Instagram Business account when a news article is published in Sanity CMS. Post includes featured image, excerpt text, and link back to the article.

## Architecture

```text
Sanity CMS (publish newsArticle)
  └── webhook POST /api/social-publish
        ├── Validate webhook secret
        ├── Fetch article (slug, title, excerpt, featuredImage)
        ├── Build public image URL (Sanity CDN, 1200x630, JPEG)
        ├── Construct caption (excerpt + link + hashtags)
        ├── POST Facebook Page photo with caption
        └── POST Instagram container → poll status → publish
```

### Flow

1. Editor publishes `newsArticle` in Sanity
2. Sanity webhook fires to `/api/social-publish` with document payload (`_id`, `_type`, `slug`)
3. Route validates secret, rejects non-`newsArticle` types
4. Fetches full article via existing content query (or new query by `_id`)
5. Builds image URL: `urlFor(image).width(1200).height(630).format('jpg').url()` (public, explicitly JPEG for Instagram compatibility)
6. Constructs caption: `{title}\n\n{excerpt}\n\nRead more: {articleUrl}`
7. Publishes to Facebook (single API call) and Instagram (two-step container flow)
8. Returns per-platform success/failure JSON

## Meta Graph API Summary

### Authentication

- Create **Meta Developer App** (Business type) at developers.facebook.com
- Use **System User token** from Meta Business Manager (no expiry date, but can be revoked or invalidated -- plan for periodic rotation)
- Get **Page Access Token** via `GET /me/accounts` (no expiry when derived from system user, but subject to revocation)
- The **Page Access Token** is what executes Graph API calls for both Facebook and Instagram publishing
- Get **Instagram Business Account ID** via `GET /{page-id}?fields=instagram_business_account`

### Permissions (need App Review for production)

| Permission                  | Platform  | Purpose              |
| --------------------------- | --------- | -------------------- |
| `pages_show_list`           | Facebook  | List managed pages   |
| `pages_read_engagement`     | Facebook  | Required with manage |
| `pages_manage_posts`        | Facebook  | Create page posts    |
| `instagram_basic`           | Instagram | Profile access       |
| `instagram_content_publish` | Instagram | Publish content      |

Dev mode may suffice if only club admins (added as app testers) trigger publishing.

### Facebook -- Photo post with link in caption

```http
POST /v22.0/{page-id}/photos
{ "caption": "...", "url": "{imageUrl}", "published": true, "access_token": "{token}" }
→ { "id": "photo_id", "post_id": "page_post_id" }
```

### Instagram -- Two-step container flow

```http
// Step 1: Create container
POST /v22.0/{ig-user-id}/media
{ "image_url": "{imageUrl}", "caption": "...", "access_token": "{token}" }
→ { "id": "container_id" }

// Step 2: Poll container status until ready
GET /v22.0/{container_id}?fields=status_code&access_token={token}
→ { "status_code": "IN_PROGRESS" | "FINISHED" | "ERROR" | "EXPIRED" }

// Step 3: Publish once status_code is FINISHED
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

Add `metaConfigSchema` to `src/lib/config.ts` (imported as `@/lib/config`):

| Variable                    | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `META_PAGE_ACCESS_TOKEN`    | Page access token derived from system user (no expiry, can be revoked) |
| `META_FACEBOOK_PAGE_ID`     | Facebook Page ID                                                       |
| `META_INSTAGRAM_ACCOUNT_ID` | Instagram Business Account ID                                          |
| `SOCIAL_PUBLISH_SECRET`     | Webhook secret for `/api/social-publish`                               |

Note: Site base URL is already available via `canonicalUrl` in Sanity `siteSettings` -- no new env var needed.

## Key Decisions

- **Direct `fetch`** over `facebook-nodejs-business-sdk` -- SDK is marketing-API-focused, overkill for simple posting
- **Dedicated route** `/api/social-publish` separate from `/api/revalidate` -- different concern, secret, error handling
- **Per-platform graceful failure** -- if Facebook fails, still attempt Instagram and vice versa
- **Sanity image pipeline** with explicit `.format('jpg')` for Instagram JPEG requirement, at OG-card dimensions (1200x630)

## Requirements

- Webhook secret validation (same pattern as `/api/revalidate`)
- Trigger only on `newsArticle` document type
- Trigger only on publish (not drafts) -- Sanity webhook filter: `!(_id in path("drafts.**"))`
- Article URL built from `canonicalUrl` (Sanity `siteSettings`) + article slug
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
- [ ] Update `.env.example` with new env vars
- [ ] Create `lib/services/socialPublishService.ts` -- `publishToFacebook()`, `publishToInstagram()`, `publishArticleToSocials()`
- [ ] Add `getArticleForSocialPublish(id)` query to `lib/content/news.ts` (title, slug, excerpt, featuredImage)
- [ ] Fetch `canonicalUrl` from Sanity `siteSettings` for article URL construction (reuse existing query)
- [ ] Create `src/app/api/social-publish/route.ts` -- webhook validation, fetch article, orchestrate publish
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

--- 

Conversation


❯ I would like to implement @docs/plans/social-media-publishing.md          
                                                                            
  Before going further, we should probably discuss which accounts I need to 
  create.                                                                   
  I'm wondering whether I could use test accounts only. The original        
  Facebook account for Williamstown is managed by someone else.             
  ⎿  Read docs/plans/social-media-publishing.md (155 lines)

⏺ Great question! Let's discuss the account setup options before diving into implementation. The Meta/Facebook API ecosystem offers several paths for development and testing:

  Testing Options

  Option 1: Full Test Environment (Recommended for Development)

  You can use Meta's test infrastructure completely independently of the production accounts:

  What you'd create:
  - Meta Developer App (in Development mode)
  - Test Facebook Page (created through the app)
  - Test Instagram Business Account (linked to test page)
  - Test System User (in a test Business Manager)

  Pros:
  - Zero risk to production accounts
  - No need for access to the real accounts during development
  - Can test freely without rate limits
  - No App Review required while in Development mode

  Cons:
  - Test posts only visible to app testers/developers
  - Need to recreate setup in production later
  - Test accounts don't reflect real account structure

  Option 2: Development Mode with Real Accounts

  Use the real Facebook Page/Instagram, but keep your app in Development mode:

  What you'd need:
  - Access to Williamstown's Facebook Page (as Admin or Editor)
  - The person managing it would need to add you as a page admin
  - Link their Instagram Business Account to your app

  Pros:
  - Tests against real account structure
  - See actual posts (though marked as from Development app)
  - Easier transition to production

  Cons:
  - Requires coordination with current account manager
  - Posts during testing appear on real page (can be deleted)
  - Need page admin access

  Option 3: Hybrid Approach

  Develop with test accounts, then do final verification with real accounts before production launch.

  My Recommendation

  Given that someone else manages the production accounts, I'd suggest Option 1 for now:

  1. Create everything in Meta's test environment
  2. Develop and test the full implementation
  3. Once working, coordinate with the account manager for production setup
  4. Keep the app in Development mode until App Review (if needed)

  Note on App Review: If only Williamstown admins will trigger publishing (and they're added as App Testers), you may not need App Review at all - Development mode might suffice permanently.

  Would you like to proceed with the test account approach, or do you prefer to coordinate with the current account manager for real account access?

❯ Let's go with Option 1.                                                   
                                                                            
  Where do I go first to create an account?                                 

⏺ Here's the step-by-step setup path:

  1. Create Meta Developer Account

  Go to: https://developers.facebook.com/

  - Click "Get Started" or "My Apps"
  - Log in with your personal Facebook account (or create one)
  - Complete the developer account registration

  2. Create a Developer App

  Once logged in:
  - Click "Create App"
  - Choose app type: "Business" (not Consumer, Gaming, or Other)
  - Fill in:
    - App name: e.g., "Williamstown SC Social Publisher (Dev)"
    - App contact email: your email
  - Click "Create App"

  3. Add Required Products

  In your new app dashboard, add these products:
  - Facebook Login (click "Set Up")
  - Instagram (click "Set Up")

  4. Create Test Page & Instagram Account

  In the app dashboard left sidebar:
  - Go to Roles → Test Users
  - Create a test user
  - Then use Graph API Explorer or create through the UI:
    - App Settings → Basic → scroll to "Test Accounts"
    - Create test Facebook Page
    - Create test Instagram Business Account linked to that page

  Alternative: Use Graph API Explorer

  You can also create test assets via:
  - Tools → Graph API Explorer in the top menu
  - This gives you more control over test data

  5. Get Your Credentials (we'll need these for the code)

  - App ID and App Secret: App Settings → Basic
  - Access Tokens: Tools → Graph API Explorer

  ---
  Next Steps:
  While you're setting up those accounts, would you like me to start planning the code implementation? I can explore the codebase, understand existing patterns (like how /api/revalidate works), and draft the implementation plan. Then when you have the test credentials ready, we'll be prepared to implement immediately.

  Or would you prefer to complete the setup first before I start planning?

❯ I'm up to the creating the app but I can see that the options have        
  slightly been updated. See screenshot.                                    
                                                                            
  Does it look right what I selected so far?                                
  ⎿  [Image #1]

⏺ Perfect! Yes, those are exactly the right use cases:

  ✅ "Manage messaging & content on Instagram" - gives you access to the Instagram API for publishing posts

  ✅ "Manage everything on your Page" - gives you access to the Pages API for publishing to Facebook Page

  These two use cases cover everything we need for the social media publishing feature. Meta has updated their flow to be more use-case driven (instead of the older "Business" app type), but these selections will give you the same API access.

  Click "Update" to proceed, then continue through the remaining steps (Business, Requirements, Overview).

  Once the app is created, you'll need to configure permissions and generate access tokens - but you're on the right track!

❯ Ok next should I be selected the 2nd option? 
  ⎿  [Image #2]

⏺ Yes, select "I don't want to connect a business portfolio yet."

  For development and testing purposes, you don't need a Business Portfolio. You can:
  - Create test pages and test Instagram accounts without it
  - Develop and test the full implementation
  - Add a Business Portfolio later when moving to production (if needed)

  A Business Portfolio is mainly useful for:
  - Managing multiple business assets across apps
  - Business verification for production
  - Advanced business analytics

  For now, keeping it simple without a Business Portfolio is the right choice. Click "Next" to continue.

❯ Ok. I'm in now.                                                           
                                                                            
  What's next. One thing at a time.                                         
  ⎿  [Image #3]

⏺ Good, you're in the app dashboard.

  Next step: Add API Products

  In the left sidebar, look for a section called "Add products" or "Products" (it might be below where you see "Testing" and "Publish").

  Click on it to see available products.

  We need to add two products:
  1. Instagram Graph API (or just "Instagram")
  2. Facebook Login (needed for Pages API access)

  Can you see a section to add products in the left sidebar? If so, click on it and let me know what you see.
