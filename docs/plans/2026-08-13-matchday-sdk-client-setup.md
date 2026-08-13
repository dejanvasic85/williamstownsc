# Matchday SDK: Env Config + API Client Wrapper

**Created:** 2026-08-13
**Status:** In Progress

## Purpose

First step of the matchday migration (williamstownsc#821, part of the sequence #821 → #814 → #815 → #816 → #817 → #818 → #819 → #820). Get `@dejanvasic85/matchday-sdk` installed, configured, and callable behind a single client wrapper — no callers wired up yet, that's #818.

## Requirements

- New env vars validated through the existing zod config pattern (`src/lib/config.ts`), not ad-hoc `process.env` reads
- SDK install works both locally and in every CI workflow that runs `pnpm install`
- `matchdayClient` importable and typed, following the "services, not utils" convention (AGENTS.md)
- Out of scope: calling any endpoint, wiring into `matchService`/`tableService`/`clubService` (#818)
- Blocked on: the deployed matchday API base URL. Not yet known — matchday hosts its API on Cloudflare Workers (their ADR 0009) but no URL has been shared. Confirm before setting `MATCHDAY_API_BASE_URL` in real environments; plan/implementation can proceed with a placeholder in `.env.example`.

## Todo

- [x] Add `matchdayConfigSchema` + `getMatchdayConfig()` to `src/lib/config.ts`
- [x] Add `MATCHDAY_API_TOKEN` and `MATCHDAY_API_BASE_URL` to `.env.example`
- [x] Add root `.npmrc` (committed, no secret inline)
- [x] `MATCHDAY_SDK_TOKEN` set up in a personal `~/.npmrc` locally and as a GitHub Actions repo secret
- [x] `pnpm add @dejanvasic85/matchday-sdk`
- [x] New `src/lib/matchday/matchdayClient.ts`: module-level singleton wrapping `createMatchdayClient({ baseUrl, apiToken })`
- [x] Wire `MATCHDAY_SDK_TOKEN` into the `pnpm install --frozen-lockfile` step's env in `.github/workflows/ci.yml` (both `test` and `e2e` jobs), `.github/workflows/deploy-sanity.yml`, and `.github/workflows/crawl.yml`
- [ ] Run `pnpm run type:check`
- [ ] Run `pnpm run lint`
- [ ] Run `pnpm run format`
- [ ] Run `pnpm run build`

## Files

- `src/lib/config.ts` — `matchdayConfigSchema`, `MatchdayConfig` type, `getMatchdayConfig()`
- `.env.example` — `MATCHDAY_API_TOKEN`, `MATCHDAY_API_BASE_URL`, `MATCHDAY_SDK_TOKEN`
- `.npmrc` — new file, scoped registry for `@dejanvasic85`
- `package.json` / `pnpm-lock.yaml` — new dependency `@dejanvasic85/matchday-sdk`
- `src/lib/matchday/matchdayClient.ts` — new file, SDK client singleton
- `.github/workflows/ci.yml` — both jobs' install step gets `MATCHDAY_SDK_TOKEN` in env
- `.github/workflows/deploy-sanity.yml` — install step gets `MATCHDAY_SDK_TOKEN` in env
- `.github/workflows/crawl.yml` — all three jobs' install steps get `MATCHDAY_SDK_TOKEN` in env (still standing until #820 removes it; would otherwise break as soon as the SDK becomes a lockfile dependency)

## Unresolved Questions

- **`MATCHDAY_API_BASE_URL` value** — need the actual deployed URL from the matchday side before this is usable outside a placeholder.
- **Installed SDK version is `0.1.0`** — the `GET /leagues?clubId=` filter referenced for #816 is documented in the source changelog as `0.2.0` but hadn't been published to GitHub Packages as of this install. Re-check before starting #816.
