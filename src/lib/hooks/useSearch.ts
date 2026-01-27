import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trackSearch } from '@/lib/analytics/searchEvents';
import type { SearchResult } from '@/lib/content/search';
import { useDebouncedValue } from './useDebouncedValue';

type SearchResponse = {
	results: SearchResult[];
};

const debounceDelayMs = 400;
const minSearchChars = 2;

function mapHttpStatusToError(status: number): string {
	switch (status) {
		case 400:
			return 'Invalid search query. Please try different keywords.';
		case 404:
			return 'Search service not found. Please try again later.';
		case 429:
			return 'Too many requests. Please wait a moment and try again.';
		case 503:
		case 504:
			return 'Search service is temporarily unavailable. Please try again later.';
		default:
			if (status >= 500) {
				return 'Server error. Please try again later.';
			}
			return 'Search failed';
	}
}

async function fetchSearchResults(query: string, signal: AbortSignal): Promise<SearchResult[]> {
	const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
		signal
	});

	if (!response.ok) {
		throw new Error(mapHttpStatusToError(response.status));
	}

	const data: SearchResponse = await response.json();
	return data.results || [];
}

type UseSearchResult = {
	results: SearchResult[];
	isLoading: boolean;
	error: string | null;
	currentQuery: string;
};

export function useSearch(inputValue: string): UseSearchResult {
	const trimmedValue = inputValue.trim();
	const hasMinChars = trimmedValue.length >= minSearchChars;
	const debouncedQuery = useDebouncedValue(trimmedValue, debounceDelayMs);
	const isEnabled = hasMinChars && debouncedQuery.length >= minSearchChars;
	const lastTrackedQuery = useRef<string>('');

	const { data, isFetching, error } = useQuery({
		queryKey: ['search', debouncedQuery],
		queryFn: ({ signal }) => fetchSearchResults(debouncedQuery, signal),
		enabled: isEnabled
	});

	useEffect(() => {
		if (
			!isFetching &&
			data !== undefined &&
			debouncedQuery &&
			debouncedQuery !== lastTrackedQuery.current
		) {
			lastTrackedQuery.current = debouncedQuery;
			trackSearch({
				searchTerm: debouncedQuery,
				resultCount: data.length
			});
		}
	}, [isFetching, data, debouncedQuery]);

	if (!hasMinChars) {
		return {
			results: [],
			isLoading: false,
			error: null,
			currentQuery: ''
		};
	}

	return {
		results: data ?? [],
		isLoading: isFetching,
		error: error instanceof Error ? error.message : null,
		currentQuery: isEnabled ? debouncedQuery : ''
	};
}
