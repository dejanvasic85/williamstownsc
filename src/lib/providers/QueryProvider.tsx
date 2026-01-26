'use client';

import { PropsWithChildren, lazy, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const staleTimeMs = 60 * 1000;

const ReactQueryDevtools =
	process.env.NODE_ENV !== 'production'
		? lazy(() =>
				import('@tanstack/react-query-devtools').then((mod) => ({
					default: mod.ReactQueryDevtools
				}))
			)
		: () => null;

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: staleTimeMs,
				retry: false
			}
		}
	});
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (typeof window === 'undefined') {
		return makeQueryClient();
	}

	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}

	return browserQueryClient;
}

export function QueryProvider({ children }: PropsWithChildren) {
	const [queryClient] = useState(getQueryClient);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
