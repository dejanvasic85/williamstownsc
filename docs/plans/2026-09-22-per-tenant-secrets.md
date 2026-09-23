# Resolve per-tenant secrets in config (#902)

**Created:** 2026-09-22
**Status:** Done

## Purpose

Route every club secret through `getTenantSecret`, so the backing store can change per club and no
call site reads a global env var for a club credential. Blocked-by #899 (registry) is done; the
resolver and `getOptionalTenantSecret` already exist.

## Requirements

- Nothing reads a club secret except through `getTenantSecret` / `getOptionalTenantSecret`.
- Per club required: `sanityWriteToken`, `revalidateSecret`.
- Per club optional group: `socialPublishing` (`metaPageAccessToken`, `metaFacebookPageId`,
  `metaInstagramAccountId`). Omitted block means social publishing is off for that club.
- Missing secret errors name the club, the secret and the key.
- System-wide, unchanged: `MATCHDAY_*`, AWS SES, reCAPTCHA, Sentry, `SOCIAL_PUBLISH_SECRET`.
- Out of scope (other issues): `getClubConfig` (#906), `NEXT_PUBLIC_SANITY_*` and client
  singletons (#904).

## Decisions

- `/api/revalidate` takes the club from the `x-tenant` header (proxy sets it from the validated
  Host). No tenant -> 400, matching rule 4 in `docs/multi-tenancy.md`.
- Social publishing enabled = the club declares the `socialPublishing` group. Per-platform toggles
  become the article's `publishToFacebook` / `publishToInstagram` flags, so drop the global
  `META_FACEBOOK_ENABLED` / `META_INSTAGRAM_ENABLED`.
- Contact form: missing tenant fails the submission instead of falling back to a global write
  client.

## Todo

- [x] `src/app/api/revalidate/route.ts`: resolve tenant from headers, read
      `getTenantSecret('revalidateSecret', tenant)`; null tenant -> 400
- [x] `src/sanity/lib/writeClient.ts`: delete legacy `getWriteClient()`; keep
      `getSanityWriteClient(tenant)`
- [x] `src/components/contact/actions.ts`: use `getSanityWriteClient(tenant)`, guard null tenant
- [x] `src/lib/social/metaPublishService.ts`: take a tenant, resolve the optional group via
      `getTenantSecret` gated on `tenant.socialPublishing`, skip publishing when the group is absent
- [x] `src/app/api/social-publish/route.ts`: pass tenant, guard null tenant
- [x] `src/lib/config.ts`: delete `getRevalidationConfig`, `getSanityWriteConfig`, `getMetaConfig`
      and their schemas/types
- [x] `.env.example`: rename club secrets to `WILLIAMSTOWN_*`, drop the Meta enable flags
- [x] Update `docs/cache-invalidation.md` and `docs/facebook-access-tokens.md` env names
- [x] Add unit tests for per-tenant meta config resolution (`metaPublishService.test.ts`). The
      revalidate route has no unit test: the repo has no `vi.mock` pattern for `next/headers`
- [x] Run `pnpm run format`
- [x] Run `pnpm run lint`
- [x] Run `pnpm run type:check`
- [x] Run `pnpm run build`
- [x] Run `pnpm run test` (68 passed) / `pnpm run test:e2e` (30 passed, 1 skipped)

## Files

- `src/app/api/revalidate/route.ts` — per-tenant revalidate secret.
- `src/sanity/lib/writeClient.ts` — drop the global-config write client.
- `src/components/contact/actions.ts` — tenant write client.
- `src/lib/social/metaPublishService.ts` — tenant-driven Meta config.
- `src/app/api/social-publish/route.ts` — pass tenant through.
- `src/lib/config.ts` — remove the three club-secret getters/schemas/types.
- `.env.example`, `docs/cache-invalidation.md`, `docs/facebook-access-tokens.md`.
- Tests beside the changed modules.

## Unresolved Questions

- None blocking. Open: whether a missing tenant in the contact action should be a soft failure or
  surface as an error message; planned as a soft failure.
