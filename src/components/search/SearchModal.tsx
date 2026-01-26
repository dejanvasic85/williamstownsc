'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useSearch } from '@/lib/hooks/useSearch';
import { SearchInput } from './SearchInput';
import { useSearchModal } from './SearchModalProvider';
import { SearchResults } from './SearchResults';

export function SearchModal() {
	const { isOpen, open, close } = useSearchModal();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const previousActiveElement = useRef<HTMLElement | null>(null);
	const [inputValue, setInputValue] = useState('');
	const { results, isLoading, error, currentQuery } = useSearch(inputValue);

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
		setInputValue('');
	};

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
						type="button"
						onClick={handleClose}
						className="hover:bg-base-300 rounded-lg p-2 transition-colors"
						aria-label="Close search"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Search Input */}
				<div className="border-base-300 border-b p-4">
					<SearchInput value={inputValue} onChange={setInputValue} isLoading={isLoading} />
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
