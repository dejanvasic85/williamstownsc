'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { SearchResult } from '@/lib/content/search';
import { SearchInput } from './SearchInput';
import { useSearchModal } from './SearchModalProvider';
import { SearchResults } from './SearchResults';

export function SearchModal() {
	const { isOpen, open, close } = useSearchModal();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const previousActiveElement = useRef<HTMLElement | null>(null);
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentQuery, setCurrentQuery] = useState('');

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			previousActiveElement.current = document.activeElement as HTMLElement;
			dialog.showModal();
		} else {
			dialog.close();
			previousActiveElement.current?.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
				event.preventDefault();
				open();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
		if (event.target === dialogRef.current) {
			close();
		}
	};

	const handleClose = () => {
		close();
		setResults([]);
		setCurrentQuery('');
		setError(null);
	};

	const handleSearch = useCallback(async (query: string) => {
		if (!query || query.length < 2) {
			setResults([]);
			setCurrentQuery('');
			setError(null);
			return;
		}

		setCurrentQuery(query);
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

			if (!response.ok) {
				throw new Error('Search failed');
			}

			const data = await response.json();
			setResults(data.results || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to search');
			setResults([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return (
		<dialog
			ref={dialogRef}
			onClose={handleClose}
			onClick={handleDialogClick}
			className="bg-base-100 w-full max-w-2xl rounded-2xl p-0 shadow-2xl backdrop:bg-black/50 lg:mt-24"
		>
			<div className="relative">
				{/* Header */}
				<div className="border-base-300 flex items-center justify-between border-b px-6 py-4">
					<h2 className="text-lg font-semibold">Search</h2>
					<button
						onClick={handleClose}
						className="hover:bg-base-300 rounded-lg p-2 transition-colors"
						aria-label="Close search"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Search Input */}
				<div className="border-base-300 border-b p-4">
					<SearchInput onSearch={handleSearch} isLoading={isLoading} />
				</div>

				{/* Search Results */}
				<div className="max-h-[60vh] overflow-y-auto p-4">
					<SearchResults
						results={results}
						isLoading={isLoading}
						error={error}
						query={currentQuery}
					/>
				</div>
			</div>
		</dialog>
	);
}
