# Error Tracking: Sentry Integration

## Purpose

Integrate Sentry into the Next.js app to capture, aggregate, and alert on production errors across client, server, and edge runtimes.

## Requirements

- Sentry free tier, US region, org `vasic-org`, project `javascript-nextjs`
- All env vars documented in `.env.example`
- Wizard output cleaned up to match project code style (no inline types, Tailwind only, etc.)
- Client and server errors captured with stack traces
- `global-error.tsx` added for root-level boundary
- Existing `error.tsx` updated to report to Sentry

## Decisions

- Run the official wizard — it handles SDK install, config files, `next.config.ts` wrapping, and `instrumentation.ts`
- DSN (`NEXT_PUBLIC_SENTRY_DSN`) and auth token (`SENTRY_AUTH_TOKEN`) stay in env vars; no need to route through `config.ts` (Sentry SDK reads them directly)
- `SENTRY_AUTH_TOKEN` is build-time only (source map uploads); must also be set in Vercel dashboard

## Todo

- [ ] Run wizard: `npx @sentry/wizard@latest -i nextjs --saas --org vasic-org --project javascript-nextjs`
- [ ] Review wizard-generated files (`sentry.*.config.ts`, `instrumentation.ts`, `next.config.ts`) for code style compliance — remove any example pages/routes it creates
- [ ] Add env vars to `.env.example`: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- [ ] Update `src/app/(site)/error.tsx` — add `useEffect` to call `Sentry.captureException(error)` on mount
- [ ] Create `src/app/global-error.tsx` — root-level boundary with Sentry capture (must include `<html>/<body>` tags per Next.js requirement)
- [ ] Run `npm run lint && npm run format && npm run type:check`
- [ ] Commit and push
- [ ] **Manual (user):** Add `SENTRY_AUTH_TOKEN` to Vercel environment variables (required for source map uploads on deploy)

## Unresolved Questions

None.
