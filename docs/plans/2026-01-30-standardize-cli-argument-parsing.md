# Standardize CLI Argument Parsing with Commander

**Created:** 2026-01-30

**Status:** ✅ Completed

## Purpose

Refactor all bin scripts to use Commander library for consistent, robust CLI argument parsing. Fixes issues with quoted strings containing spaces and provides better help text across all scripts.

## Problem

- Manual `process.argv` parsing fails with quoted strings containing spaces
- Inconsistent error handling and help text across scripts
- `crawlClubs.ts` silently defaults (bad UX)
- No type safety for CLI arguments

## Solution

Use Commander library (already installed) to provide:

- Automatic handling of quoted strings
- Type-safe option definitions
- Auto-generated help text
- Consistent error messages
- Input validation

## Implementation Completed

### 1. bin/crawlClubs.ts

- ✅ Added Commander with `--url` option
- ✅ Replaced manual `parseArgs()` with Commander setup
- ✅ Updated `crawlClubs()` to use `program.opts()`

### 2. bin/crawlFixtures.ts

- ✅ Removed `parseArgs()` function
- ✅ Removed manual help text and validation
- ✅ Added Commander setup with required `--league` option
- ✅ Updated `crawlFixtures()` to use `program.opts()`
- ✅ Kept `CliArgs` type for `applyFilters()` compatibility

### 3. bin/syncFixtures.ts

- ✅ Removed `parseArgs()` function
- ✅ Removed manual help text and validation
- ✅ Added Commander setup with required `--league` option
- ✅ Updated `main()` to use `program.opts()`

### 4. bin/syncClubs.ts

- ✅ No changes needed (takes no arguments)

## Verification Completed

### Code Quality Checks

```bash
✅ npm run type:check - Passed
✅ npm run lint - Passed
✅ npm run format - Passed
```

### Help Text Tests

```bash
✅ npm run crawl:clubs -- --help
✅ npm run crawl:fixtures -- --help
✅ npm run sync:fixtures -- --help
```

### Error Handling Tests

```bash
✅ npm run crawl:fixtures (missing required argument)
✅ npm run sync:fixtures (missing required argument)
```

## Benefits Achieved

1. **Handles quotes automatically** - `--league "State League 2 Men's - North-West"` works perfectly
2. **Auto-generated help** - `--help` shows proper usage for all scripts
3. **Type safety** - Options are strongly typed
4. **Validation** - Required options enforced automatically
5. **Consistency** - All scripts follow same pattern
6. **Better UX** - Clear error messages for missing/invalid args
