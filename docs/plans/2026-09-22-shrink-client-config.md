# Shrink ClientConfig to the reCAPTCHA site key

**Created:** 2026-09-22
**Status:** Done

## Purpose

Stop shipping Sanity project details to the browser. `ClientConfig` is handed to the client by
`ConfigProvider`, but the only field any client component reads is `recaptchaSiteKey`. Everything
else is per-club data that belongs on the server.

Branch: `refactor/shrink-client-config`. Relates to #902 (client-boundary cleanup) and #904 (the
singletons this leaves behind).

## Requirements

- `ClientConfig` = `{ recaptchaSiteKey }` only. No `sanityProjectId`, `sanityDataset`,
  `sanityApiVersion`.
- `getClientConfig()` reads only `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
- The read/write client singletons keep working, but stop importing `getClientConfig`. Moving them
  to the tenant registry is #904, not this change.
- No `.env` value renamed here. Existing `NEXT_PUBLIC_SANITY_*` vars keep working server-side.

Out of scope: deleting the `client`/`writeClient` singletons, migrating `lib/content`, cache tags.

## Todo

- [x] `clientConfigSchema` -> `{ recaptchaSiteKey: z.string().optional() }`; drop the Sanity fields
- [x] Update `getClientConfig()` to read only the site key; drop `cachedClientConfig` global
- [x] Keep `sanityApiVersion` with the project/dataset in the transitional getter
- [x] Add a transitional server-only `getSanityReadConfig()` for the singletons (project id,
      dataset, apiVersion), marked for removal in #904
- [x] Point `sanity/lib/client.ts` and `sanity/lib/writeClient.ts` at the new getter
- [x] `getSanityWriteClient(tenant)` takes only `apiVersion` from config
- [x] Fix `sanity.cli.ts`, which reads the Sanity project from `getClientConfig()`
- [x] Confirm `verifyToken.ts` and `contact/actions.ts` still compile (site key only)
- [x] Add a unit test: `getClientConfig()` returns only `recaptchaSiteKey` even when Sanity env set
- [x] Run `pnpm run format`
- [x] Run `pnpm run lint`
- [x] Run `pnpm run type:check`
- [x] Run `pnpm run build`

## Decisions

- Narrow scope. The singletons stay and read the same env vars through `getSanityReadConfig()`,
  server-side only. Deleting them is #904.
- `sanityApiVersion` lives in `getSanityReadConfig()`, not a separate constant, so the whole
  transitional Sanity read config disappears in one place.
- `sanity.cli.ts` hardcodes the reference project (`1ougwkz1` / `production`).
- `NEXT_PUBLIC_SANITY_*` names are left as-is; renaming belongs with #904.

## Files

| File                                   | Change                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| `src/lib/config.ts`                    | Shrink schema/type; split Sanity reads into a transitional server getter        |
| `src/sanity/lib/client.ts`             | Read project/dataset/apiVersion from the transitional getter, not client config |
| `src/sanity/lib/writeClient.ts`        | Same; `getSanityWriteClient` needs apiVersion only                              |
| `sanity.cli.ts`                        | Point at a fixed reference project instead of `getClientConfig()`               |
| `src/app/[tenant]/layout.tsx`          | ConfigProvider now passes only the site key (no code change expected)           |
| `src/lib/providers/ConfigProvider.tsx` | Unchanged; type shrinks with `ClientConfig`                                     |
| `src/lib/config.test.ts`               | Asserts the client config carries only the site key                             |

## Unresolved Questions

None. The decisions above close the four questions raised while planning.
