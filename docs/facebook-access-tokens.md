# Generating a Long-Lived Facebook Access Token (for Page Publishing)

This guide explains how to generate a **long-lived User access token** and then derive a **Page access token** for posting to a Facebook Page via the Graph API.

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

## Step 3 — Exchange for a long-lived User token

Make a **GET** request to the OAuth endpoint and use the environment variables from vercel.

```sh
curl -G \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=APP_ID" \
  -d "client_secret=APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_USER_TOKEN" \
  https://graph.facebook.com/v24.0/oauth/access_token
```

The access token is a short lived on which is about 2 months. Then we call this endpoint to get one that does NOT Expire:

```sh
curl "https://graph.facebook.com/v24.0/me/accounts?access_token=xxx"
```

Find the access token in that response for Williamstown Soccer Club page. You can put the token in the [debugger](https://developers.facebook.com/tools/debug/accesstoken/) to see the details. For example, is it a user token or a page token?

But most importantly, it should not expire.
Set the environment variable `META_PAGE_ACCESS_TOKEN` in .env.local or Vercel.

## Step 4 - Try call the API route to publish to the page

```sh
curl -X POST http://localhost:3003/api/social-publish \
  -H "Content-Type: application/json" \
  -H "x-social-publish-secret: xxx" \
  -d '{
    "_id": "af458bad-4473-47d5-8a82-f45fedb15114",
    "_type": "newsArticle"
  }'
```
