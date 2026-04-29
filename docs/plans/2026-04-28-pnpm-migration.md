# Migrate repo to pnpm

**Created:** 2026-04-28
**Status:** In Progress

## Purpose

Standardize project package manager on pnpm. Keep local docs and GitHub workflows aligned to prevent drift and CI failures.

## Requirements

- Use pnpm as canonical package manager for local and CI workflows
- Remove npm lockfile and commit pnpm lockfile
- Update script references in active docs and workflow docs
- Update GitHub Actions install and command steps to pnpm

## Todo

- [x] Generate `pnpm-lock.yaml` from current dependency graph
- [x] Add `packageManager` in `package.json`
- [x] Update build script chaining in `package.json` to pnpm
- [x] Configure `pnpm.onlyBuiltDependencies` for known postinstall/build-script deps
- [x] Remove `package-lock.json`
- [x] Migrate `.github/workflows/ci.yml` to pnpm install/exec/run commands
- [x] Migrate `.github/workflows/crawl.yml` to pnpm install/exec/run commands and lockfile cache key
- [x] Migrate `.github/workflows/deploy-sanity.yml` to pnpm install/run commands
- [x] Update command docs in `README.md`
- [x] Update command docs in `AGENTS.md`
- [x] Run `pnpm run type:check`
- [x] Run `pnpm run lint`
- [x] Run `pnpm run format`
- [x] Run `pnpm run build`
- [ ] Run `pnpm run test:e2e` (1 failing test: `tests/search.spec.ts` navigation assertion)

## Files

- `package.json`: set pnpm package manager, update build chaining, add pnpm build-script allowlist
- `pnpm-lock.yaml`: new lockfile generated via pnpm install
- `package-lock.json`: removed
- `.github/workflows/ci.yml`: npm/npx commands replaced with pnpm equivalents
- `.github/workflows/crawl.yml`: npm/npx commands replaced with pnpm equivalents, cache key now uses pnpm lockfile
- `.github/workflows/deploy-sanity.yml`: npm commands replaced with pnpm equivalents
- `README.md`: local setup and schema typegen commands updated to pnpm
- `AGENTS.md`: workflow command references updated to pnpm
