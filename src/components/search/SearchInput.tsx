'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';

type SearchInputProps = {
	onSearch: (query: string) => void;
	isLoading?: boolean;
};

export function SearchInput({ onSearch, isLoading = false }: SearchInputProps) {
	const [value, setValue] = useState('');
	const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}

		if (value.trim().length < 2) {
			onSearch('');
			return;
		}

		debounceTimeout.current = setTimeout(() => {
			onSearch(value.trim());
		}, 400);

		return () => {
			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current);
			}
		};
	}, [value, onSearch]);

	const handleClear = () => {
		setValue('');
		inputRef.current?.focus();
	};

	return (
		<div className="relative">
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
				{isLoading ? (
					<Loader2 className="text-base-content/40 h-5 w-5 animate-spin" aria-hidden="true" />
				) : (
					<Search className="text-base-content/40 h-5 w-5" aria-hidden="true" />
				)}
			</div>
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Search news, teams, programs..."
				className="input input-bordered w-full pr-12 pl-12"
				aria-label="Search content"
				aria-describedby="search-hint"
			/>
			{value && (
				<button
					type="button"
					onClick={handleClear}
					className="hover:bg-base-300 absolute inset-y-0 right-0 flex items-center pr-4 transition-colors"
					aria-label="Clear search"
				>
					<X className="text-base-content/60 h-5 w-5" />
				</button>
			)}
			<div id="search-hint" className="sr-only">
				Type at least 2 characters to search
			</div>
		</div>
	);
}
