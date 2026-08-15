import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { LayoutProps } from 'sanity';

const staleTimeMs = 60 * 1000;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: staleTimeMs,
			retry: false
		}
	}
});

export function StudioLayout({ renderDefault, ...props }: LayoutProps) {
	return (
		<QueryClientProvider client={queryClient}>
			{renderDefault({ ...props, renderDefault })}
		</QueryClientProvider>
	);
}
