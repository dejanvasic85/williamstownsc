'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useSearchModal } from './SearchModalProvider';

export function SearchModal() {
	const { isOpen, open, close } = useSearchModal();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const previousActiveElement = useRef<HTMLElement | null>(null);

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
						onClick={handleClose}
						className="hover:bg-base-300 rounded-lg p-2 transition-colors"
						aria-label="Close search"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content - placeholder for now */}
				<div className="p-6">
					<p className="text-base-content/60 text-sm">Search functionality coming soon...</p>
					<p className="text-base-content/40 mt-2 text-xs">
						Press <kbd className="kbd kbd-sm">ESC</kbd> to close or{' '}
						<kbd className="kbd kbd-sm">⌘K</kbd> / <kbd className="kbd kbd-sm">Ctrl+K</kbd> to open
					</p>
				</div>
			</div>
		</dialog>
	);
}
