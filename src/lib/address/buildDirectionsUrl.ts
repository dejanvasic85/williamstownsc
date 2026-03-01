import type { SiteSettings } from '@/sanity/sanity.types';
import { formatAddress } from './formatAddress';

type Location = NonNullable<SiteSettings['locations']>[number];

export function buildDirectionsUrl(location: Location): string {
	const address = formatAddress(location);
	return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
