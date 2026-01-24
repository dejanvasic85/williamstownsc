'use client';

import { useRouter } from 'next/navigation';
import { SearchResult } from '@/lib/content/search';
import { useSearchModal } from './SearchModalProvider';

type SearchResultsProps = {
	results: SearchResult[];
	isLoading: boolean;
	error: string | null;
	query: string;
};

const contentTypeLabels: Record<string, string> = {
	newsArticle: 'News',
	team: 'Team',
	program: 'Program',
	aboutPage: 'Page',
	accessibilityPage: 'Page',
	committeePage: 'Page',
	contactPage: 'Page',
	keyDatesPage: 'Page',
	locationsPage: 'Page',
	merchandisePage: 'Page',
	newsPage: 'Page',
	policiesPage: 'Page',
	privacyPage: 'Page',
	programsPage: 'Page',
	sponsorsPage: 'Page',
	teamsPage: 'Page',
	termsPage: 'Page'
};

function groupResultsByType(results: SearchResult[]) {
	const groups: Record<string, SearchResult[]> = {};

	results.forEach((result) => {
		const label = contentTypeLabels[result._type] || 'Other';
		if (!groups[label]) {
			groups[label] = [];
		}
		groups[label].push(result);
	});

	return groups;
}

export function SearchResults({ results, isLoading, error, query }: SearchResultsProps) {
	const router = useRouter();
	const { close } = useSearchModal();

	const handleResultClick = (url: string) => {
		close();
		router.push(url);
	};

	const handleKeyDown = (event: React.KeyboardEvent, url: string) => {
		if (event.key === 'Enter') {
			handleResultClick(url);
		}
	};

	if (error) {
		return (
			<div className="text-error py-8 text-center text-sm" role="alert" aria-live="polite">
				{error}
			</div>
		);
	}

	if (!query || query.length < 2) {
		return (
			<div className="text-base-content/60 py-8 text-center text-sm">
				Type at least 2 characters to search
			</div>
		);
	}

	if (isLoading) {
		return (
			<div
				className="text-base-content/60 py-8 text-center text-sm"
				aria-live="polite"
				aria-busy="true"
			>
				Searching...
			</div>
		);
	}

	if (results.length === 0) {
		return (
			<div
				className="text-base-content/60 py-8 text-center text-sm"
				role="status"
				aria-live="polite"
			>
				No results found for &quot;{query}&quot;
			</div>
		);
	}

	const groupedResults = groupResultsByType(results);

	return (
		<div role="region" aria-live="polite" aria-label="Search results">
			<div className="text-base-content/60 mb-4 text-sm">
				Found {results.length} result{results.length === 1 ? '' : 's'}
			</div>
			<div className="space-y-6">
				{Object.entries(groupedResults).map(([type, typeResults]) => (
					<div key={type}>
						<h3 className="text-base-content/80 mb-2 text-xs font-semibold uppercase">{type}</h3>
						<ul role="list" className="space-y-2">
							{typeResults.map((result) => (
								<li key={result._id}>
									<button
										onClick={() => handleResultClick(result.url)}
										onKeyDown={(e) => handleKeyDown(e, result.url)}
										className="hover:bg-base-200 focus:ring-primary w-full rounded-lg p-3 text-left transition-colors focus:ring-2 focus:outline-none"
										aria-label={`${result.title} - ${type}`}
									>
										<div className="mb-1 flex items-start justify-between gap-2">
											<h4 className="text-base-content font-medium">{result.title}</h4>
											<span className="badge badge-sm badge-outline shrink-0">
												{contentTypeLabels[result._type]}
											</span>
										</div>
										{result.excerpt && (
											<p className="text-base-content/70 text-sm">{result.excerpt}</p>
										)}
									</button>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
