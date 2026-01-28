'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';
import { trackSearchModalClose, trackSearchModalOpen } from '@/lib/analytics/searchEvents';

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

	const open = () => {
		setIsOpen((prev) => {
			if (!prev) trackSearchModalOpen();
			return true;
		});
	};

	const close = () => {
		setIsOpen((prev) => {
			if (prev) trackSearchModalClose();
			return false;
		});
	};

	const toggle = () => {
		setIsOpen((prev) => {
			const newState = !prev;
			if (newState) {
				trackSearchModalOpen();
			} else {
				trackSearchModalClose();
			}
			return newState;
		});
	};

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
