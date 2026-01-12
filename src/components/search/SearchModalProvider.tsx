'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';

type SearchModalContextType = {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
};

const SearchModalContext = createContext<SearchModalContextType | undefined>(undefined);

type SearchModalProviderProps = {
	children: ReactNode;
};

export function SearchModalProvider({ children }: SearchModalProviderProps) {
	const [isOpen, setIsOpen] = useState(false);

	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);
	const toggle = () => setIsOpen((prev) => !prev);

	return (
		<SearchModalContext.Provider value={{ isOpen, open, close, toggle }}>
			{children}
		</SearchModalContext.Provider>
	);
}

export function useSearchModal() {
	const context = useContext(SearchModalContext);
	if (context === undefined) {
		throw new Error('useSearchModal must be used within a SearchModalProvider');
	}
	return context;
}
