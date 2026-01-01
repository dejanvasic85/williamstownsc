import { MapPin } from 'lucide-react';
import { Icon } from '@/components/Icon';

interface SocialLink {
	name: string;
	href: string;
	icon: string;
}

interface SocialLinksProps {
	links: SocialLink[];
}

export const SocialLinks = ({ links = [] }: SocialLinksProps) => {
	return (
		<div className="flex items-center gap-0">
			{links.map((social) => (
				<a
					key={social.name}
					href={social.href}
					target="_blank"
					rel="noopener noreferrer"
					className="text-base-content hover:bg-base-300 rounded-full p-1.5 transition-colors hover:ring-2 sm:p-2"
					aria-label={social.name}
				>
					{social.icon === 'mapPin' ? (
						<MapPin className="h-5 w-5 sm:h-5 sm:w-5" />
					) : (
						<Icon
							name={social.icon as 'facebook' | 'instagram' | 'youtube'}
							className="h-5 w-5 sm:h-5 sm:w-5"
						/>
					)}
				</a>
			))}
		</div>
	);
};
