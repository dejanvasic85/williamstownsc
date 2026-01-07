import Image from 'next/image';
import { type SocialLink, SocialLinks } from './SocialLinks';

interface MobileHeaderProps {
	logoUrl?: string;
	logoAlt?: string;
	clubName?: string;
	socialLinks: SocialLink[];
}

export function MobileHeader({ logoUrl, logoAlt, clubName, socialLinks }: MobileHeaderProps) {
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
			<SocialLinks links={socialLinks} />
		</div>
	);
}
