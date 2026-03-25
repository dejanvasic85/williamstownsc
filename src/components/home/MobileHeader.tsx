'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { useSearchModal } from '@/components/search';
import { type SocialLink, SocialLinks } from './SocialLinks';

interface MobileHeaderProps {
	logoUrl?: string;
	logoAlt?: string;
	clubName?: string;
	socialLinks: SocialLink[];
}

export function MobileHeader({ logoUrl, logoAlt, clubName, socialLinks }: MobileHeaderProps) {
	const { open: openSearchModal } = useSearchModal();

	return (
		<div className="flex items-center justify-between px-4 py-4 lg:hidden">
			<div className="flex items-center gap-2">
				{logoUrl && (
					<Image
						src={logoUrl}
						alt={logoAlt || 'Club logo'}
						width={40}
						height={40}
						className="h-10 w-auto shrink-0"
					/>
				)}
				{clubName && <h1 className="text-lg font-bold sm:text-xl">{clubName}</h1>}
			</div>
			<div className="flex items-center gap-0">
				<button
					onClick={openSearchModal}
					className="text-base-content hover:bg-base-300 rounded-full p-1.5 transition-colors hover:ring-2 sm:p-2"
					aria-label="Search"
				>
					<Search className="h-5 w-5 sm:h-5 sm:w-5" />
				</button>
				<SocialLinks links={socialLinks} />
			</div>
		</div>
	);
}
