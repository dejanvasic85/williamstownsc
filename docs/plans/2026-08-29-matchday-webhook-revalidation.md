# Matchday Webhook Revalidation

**Created:** 2026-08-29
**Status:** In Progress

## Purpose

Refresh fixture, result, and table pages after Matchday changes a subscribed league. Keep the
existing one-hour incremental static regeneration (ISR) interval as a fallback for missed webhooks.

## Requirements

- Add a dedicated `POST /api/webhooks/matchday` route. Do not mix the Matchday contract into the
  Sanity-only `/api/revalidate` route.
- Read the raw request body before JSON parsing. Verify `X-Matchday-Signature` against the exact
  bytes using HMAC-SHA256.
- Cache every league-scoped Matchday request with `matchday:league:<leagueId>` and a one-hour
  fallback lifetime.
- Keep cache configuration in one Matchday service and pass it through SDK `2.3.0`.
- Verify signatures with `@dejanvasic85/matchday-sdk`; keep protocol details out of the website.
- Validate `{ leagueId, hasChanges, crawledAt }` at runtime. Reject malformed or unsigned requests.
- Return success without invalidation when `hasChanges` is `false`.
- Revalidate only `matchday:league:<leagueId>` when changes exist. Let Next.js invalidate every
  page that consumed the tagged data.
- Keep route work below Matchday's five-second delivery timeout.
- Accept multiple webhook secrets because Matchday creates one secret per league subscription.
  Validate the secret list through server-only config and never log it.
- Keep the current `revalidate = 3600` values. Matchday does not retry failed webhook deliveries.
- Treat duplicate deliveries as safe and idempotent.
- Keep `/api/calendar/[slug]` out of invalidation; its `GET` route is not cached by default.
- Expire Matchday tags immediately so the first request after a result webhook reads fresh data.
- Document that tag invalidation triggers regeneration on demand; the webhook does not run an
  eager rebuild.

## Todo

- [x] Add SDK request-init pass-through and webhook signature verification.
- [x] Release SDK `2.3.0` and update the website dependency and lockfile.
- [x] Add shared league tag and request-init creation to the website.
- [x] Apply the tagged request init to fixtures, table, league metadata, and league teams.
- [ ] Add `MATCHDAY_WEBHOOK_SECRETS` parsing to server config and `.env.example`.
- [ ] Add a small Matchday webhook service for payload validation and signature verification.
- [ ] Add `POST /api/webhooks/matchday` with clear 2xx, 400, 401, and 500 responses and safe logs.
- [ ] Add Playwright request tests for missing or invalid signatures, invalid payloads,
      `hasChanges: false`, and successful invalidation.
- [ ] Update `docs/cache-invalidation.md` with the separate Matchday flow, lazy regeneration,
      fallback interval, and setup steps.
- [ ] Deploy the route before configuring subscription webhooks.
- [ ] Run `mday client list`, then configure each Williamstown subscription with
      `mday client set-webhook <sub_id> --url <production-url>`.
- [ ] Store every one-time webhook secret in Vercel and redeploy before relying on notifications.
- [ ] Send one unchanged and one changed test crawl; confirm response logs and page refreshes.
- [x] Run `pnpm run format`.
- [x] Run `pnpm run lint`.
- [x] Run `pnpm run type:check`.
- [x] Run `pnpm run build`.
- [ ] Run `pnpm run test:e2e`.
- [x] Run the caveman review and address agreed findings.

## Files

- `src/lib/matchday/matchdayCacheService.ts` — create league tags and shared SDK request options.
- `src/lib/matchday/matchdayMatchService.ts` — tag fixture requests.
- `src/lib/matchday/matchdayTableService.ts` — tag table requests.
- `src/lib/matchday/matchdayLeagueMetaService.ts` — tag league metadata requests.
- `src/lib/matchday/matchdayClubService.ts` — tag league team requests.
- `src/lib/config.ts` — validate the webhook secret list.
- `src/lib/matchday/matchdayWebhookService.ts` — validate deliveries and select cache paths.
- `src/app/api/webhooks/matchday/route.ts` — receive and acknowledge Matchday deliveries.
- `tests/matchday-webhook.spec.ts` — cover the route contract with Playwright.
- `.env.example` — document the server-only secret list.
- `docs/cache-invalidation.md` — document Sanity and Matchday as separate invalidation sources.

## Unresolved Questions

- Confirm the one-hour ISR fallback is enough for a missed delivery. Matchday currently makes one
  attempt and does not retry.
- Decide whether the first release should add a signed subscription identifier to the Matchday
  payload. It improves secret selection and logs but is not required for safe invalidation.
