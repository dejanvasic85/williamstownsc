import type { SocialLink } from '@/components/home/SocialLinks';
import { formatAddress } from '@/lib/address';
import type { SiteSettings } from '@/sanity/sanity.types';

type Location = NonNullable<SiteSettings['locations']>[number];

interface SiteSettingsSocials {
	facebook?: string;
	instagram?: string;
	youtube?: string;
}

interface BuildSocialLinksOptions {
	locations?: Location[] | null;
	socials?: SiteSettingsSocials;
}

function getHomeGroundLink(locations?: Location[] | null): string | null {
	const homeGround = locations?.find((location) => location.facilityType === 'home');
	if (!homeGround) return null;

	if (homeGround.mapLink) {
		return homeGround.mapLink;
	}

	const address = formatAddress(homeGround);
	if (address) {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
	}

	return null;
}

export function buildSocialLinks({ locations, socials }: BuildSocialLinksOptions): SocialLink[] {
	const homeGroundLink = getHomeGroundLink(locations);

	return [
		...(homeGroundLink ? [{ name: 'Home Ground', href: homeGroundLink, icon: 'mapPin' }] : []),
		...(socials?.facebook ? [{ name: 'Facebook', href: socials.facebook, icon: 'facebook' }] : []),
		...(socials?.instagram
			? [{ name: 'Instagram', href: socials.instagram, icon: 'instagram' }]
			: []),
		...(socials?.youtube ? [{ name: 'YouTube', href: socials.youtube, icon: 'youtube' }] : [])
	];
}
