# Error Tracking: Sentry Integration

**Created:** 2026-02-18

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

## Prerequisites (user action)

Add the Sentry MCP server to Claude Code so errors can be verified end-to-end:

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

Then restart Claude Code — it will prompt for OAuth authentication with Sentry.

## Implementation Steps

### 1. Run the Sentry wizard

```bash
npx @sentry/wizard@latest -i nextjs --saas --org vasic-org --project javascript-nextjs
```

The wizard installs `@sentry/nextjs`, creates `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, and wraps `next.config.ts` with `withSentryConfig`.

### 2. Clean up wizard output

- Remove any example pages/routes wizard generates (e.g. `src/app/sentry-example-page/`, `src/app/api/sentry-example-api/`)
- Review all generated files for code style compliance (no inline types, no `img` tags, Tailwind only)
- Ensure `sentry.*.config.ts` files only contain essential config

### 3. Update `.env.example`

Add:

```
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=vasic-org
SENTRY_PROJECT=javascript-nextjs
SENTRY_URL=https://sentry.io
```

### 4. Update `src/app/(site)/error.tsx`

Add `useEffect` that calls `Sentry.captureException(error)` on mount:

```tsx
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

// inside component:
useEffect(() => {
	Sentry.captureException(error);
}, [error]);
```

### 5. Create `src/app/global-error.tsx`

Root-level error boundary — must include `<html>/<body>` tags per Next.js requirement:

```tsx
'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

type GlobalErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html>
			<body>
				{/* minimal error UI */}
				<button onClick={reset}>Try again</button>
			</body>
		</html>
	);
}
```

### 6. Run verifications

```bash
npm run lint
npm run format
npm run type:check
```

### 7. Verify end-to-end (via Sentry MCP)

- Trigger a test error (wizard may have a test route, or manually throw in a page)
- Use Sentry MCP tools to confirm the error appears in the `javascript-nextjs` project

### 8. User action: Add `SENTRY_AUTH_TOKEN` to Vercel

Required for source map uploads on deploy — add in Vercel dashboard under Environment Variables.

## Todo

- [x] Run wizard: installed `@sentry/nextjs` manually (wizard requires interactive TTY)
- [x] Review wizard-generated files (`sentry.*.config.ts`, `instrumentation.ts`, `next.config.ts`) for code style compliance — no example pages generated
- [x] Add env vars to `.env.example`: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_URL`
- [x] Update `src/app/(site)/error.tsx` — add `useEffect` to call `Sentry.captureException(error)` on mount
- [x] Create `src/app/global-error.tsx` — root-level boundary with Sentry capture (must include `<html>/<body>` tags per Next.js requirement)
- [x] Run `npm run lint && npm run format && npm run type:check`
- [ ] Commit and push
- [ ] **Manual (user):** Add `SENTRY_AUTH_TOKEN` to Vercel environment variables (required for source map uploads on deploy)

## Critical Files

- `next.config.ts` — wrapped by wizard with `withSentryConfig`
- `src/app/(site)/error.tsx` — add Sentry capture
- `src/app/global-error.tsx` — create new
- `.env.example` — add Sentry vars
- `instrumentation.ts` — created by wizard
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — created by wizard

## Notes

- DSN and auth token are read directly by Sentry SDK — no need to add to `src/lib/config.ts`
- `SENTRY_AUTH_TOKEN` is build-time only (source map uploads)

## Unresolved Questions

None.
