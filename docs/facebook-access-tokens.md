# Generating a Long-Lived Facebook Access Token (for Page Publishing)

This guide explains how to generate a long-lived **User access token**, then use it to get a **Page access token** for posting to a Facebook Page through the Graph API.

> Facebook does **not** issue long-lived Page tokens directly.
> You must first create a long-lived **User** token.

---

## Prerequisites

- A Meta App
- You are an **Admin / Developer / Tester** of the app
- You manage the Facebook Page you want to publish to
- The app has the following permissions enabled:
  - `pages_show_list`
  - `pages_manage_posts`
  - `pages_manage_metadata`
  - `pages_read_engagement`

---

## Step 1 — Get App credentials

1. Go to **Meta Developer Dashboard**
2. Select your app
3. Open **App settings → Basic**
4. Copy:
   - **App ID**
   - **App Secret**

Store these securely (server-side only).

---

## Step 2 — Generate a short-lived User token

1. Open **Tools → Graph API Explorer**
2. Select your app
3. Click **Generate Access Token**
4. Approve the required permissions
5. Copy the generated **User access token**

This token is short-lived (≈1 hour).

---

## Step 3 — Exchange for a long-lived User token (expires in about 60 days)

Make a **GET** request to the OAuth endpoint, using the app credentials stored as environment variables in Vercel.

```sh
curl -G \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=FACEBOOK_APP_ID" \
  -d "client_secret=FACEBOOK_APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_USER_TOKEN" \
  https://graph.facebook.com/v22.0/oauth/access_token
```

Next, get an access token for a specific page:

Williamstown testing page example:

```sh
curl "https://graph.facebook.com/v22.0/961368350398109?fields=access_token&access_token=LONG_LIVED_USER_TOKEN"
```

Williamstown production page example:

```sh
curl "https://graph.facebook.com/v22.0/559699174041802?fields=access_token&access_token=LONG_LIVED_USER_TOKEN"
```

Find the access token in that response for the Williamstown Soccer Club page. To check its details — including whether it's a user token or a page token — paste it into the [debugger](https://developers.facebook.com/tools/debug/accesstoken/).

This page token should not expire. Set it as the `META_PAGE_ACCESS_TOKEN` environment variable in `.env.local` or Vercel.

## Step 4 — Call the API route to publish to the page

```sh
curl -X POST http://localhost:3003/api/social-publish \
  -H "Content-Type: application/json" \
  -H "x-social-publish-secret: xxx" \
  -d '{
    "_id": "af458bad-4473-47d5-8a82-f45fedb15114",
    "_type": "newsArticle"
  }'
```
