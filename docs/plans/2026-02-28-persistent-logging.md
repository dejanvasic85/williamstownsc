# Persistent Structured Logging

**Created:** 2026-02-28
**Status:** Complete

## Purpose

Replace console.\* with pino structured logging. Forward server logs to Sentry Logs (5GB free) for persistence beyond Vercel's log rotation. JSON in prod, pretty-print in dev.

## Approach: Pino + Sentry Logs Integration

- **pino** v10.3.1 as logging library
- **pino-pretty** v13.1.3 (dev dep) for readable dev output
- **Sentry pinoIntegration** forwards pino logs to Sentry Logs
- SDK 10.40.0 already meets 10.18.0+ requirement

## Requirements

- Structured JSON in production, pretty-print in dev
- Persistent via Sentry Logs (free 5GB)
- Works in Next.js server runtime AND CLI scripts
- Request logging for API routes (method, route, status, duration)
- Never log secrets/tokens/credentials

## Todo

- [x] Install pino + pino-pretty
- [x] Add serverExternalPackages to next.config.ts
- [x] Create src/lib/logger.ts
- [x] Enable Sentry Logs + pinoIntegration in sentry configs
- [x] Migrate src/ console calls to pino (15 files, 30 calls)
- [x] Add request logging to API routes
- [x] Migrate bin/ console calls to pino (4 files, 84 calls)
- [x] Run lint, format, type-check, build
- [x] Commit and push

## Unresolved Questions

None.
