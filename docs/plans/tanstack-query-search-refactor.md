# Plan: Refactor Search to TanStack Query

## Overview

Replace manual state management (4 useState hooks + AbortController) with TanStack Query for cleaner, more maintainable search functionality.

## Current State

`SearchModal.tsx` manages:
- `results`, `isLoading`, `error`, `currentQuery` via useState
- Manual AbortController for request cancellation
- Manual fetch + error handling (~35 lines)

`SearchInput.tsx` handles debounce with setTimeout/useRef.

## Proposed Changes

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/providers/QueryProvider.tsx` | TanStack Query provider (Next.js App Router pattern) |
| `src/lib/hooks/useDebouncedValue.ts` | Reusable debounce hook |
| `src/lib/hooks/useSearch.ts` | Encapsulates query logic + debounce |

### Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `@tanstack/react-query@5` + devtools |
| `src/app/(site)/layout.tsx` | Wrap with QueryProvider |
| `src/components/search/SearchModal.tsx` | Replace 4 useState + fetch with `useSearch` hook |
| `src/components/search/SearchInput.tsx` | Simplify to controlled component (remove debounce) |

## Implementation Steps

1. `npm install @tanstack/react-query@5` + `npm install -D @tanstack/react-query-devtools@5`
2. Create `QueryProvider.tsx` - singleton QueryClient pattern + ReactQueryDevtools (dev only)
3. Create `useDebouncedValue.ts` - value + delay -> debounced value
4. Create `useSearch.ts`:
   - Uses useDebouncedValue (400ms)
   - Uses useQuery with `enabled` option (min 2 chars)
   - Passes AbortSignal for cancellation
   - Maps HTTP status to user-friendly errors
   - Returns `{ results, isLoading, error, currentQuery }`
5. Update layout.tsx - add QueryProvider
6. Refactor SearchModal:
   - Replace `useState` x4 + handleSearch with `useSearch(inputValue)`
   - Keep modal open/close logic, keyboard shortcuts unchanged
7. Simplify SearchInput:
   - Convert to controlled: `value` + `onChange` props
   - Remove internal debounce logic

## Before/After Comparison

**SearchModal.tsx Before:**
```typescript
const abortControllerRef = useRef<AbortController | null>(null);
const [results, setResults] = useState<SearchResult[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [currentQuery, setCurrentQuery] = useState('');
// + 35-line handleSearch callback
```

**SearchModal.tsx After:**
```typescript
const [inputValue, setInputValue] = useState('');
const { results, isLoading, error, currentQuery } = useSearch(inputValue);
```

## Configuration Defaults

| Setting | Value | Rationale |
|---------|-------|-----------|
| `staleTime` | 60s | Cache recent searches, fewer API calls |
| `retry` | false | Don't hammer failing API |
| `debounce` | 400ms | Match current behavior |
| `minChars` | 2 | Match current behavior |
| DevTools | Yes (dev only) | Debugging queries/cache in browser |

## Verification

```bash
npm run lint
npm run format
npm run type:check
npm run build
npm run test:e2e -- tests/search.spec.ts
```

Manual: Cmd+K opens modal, search works, keyboard nav works, ESC clears and closes.
