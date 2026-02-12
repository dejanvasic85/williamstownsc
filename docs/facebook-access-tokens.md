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

Make a **GET** request to the OAuth endpoint:

```bash
curl -G \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=APP_ID" \
  -d "client_secret=APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_USER_TOKEN" \
  https://graph.facebook.com/v24.0/oauth/access_token
```
