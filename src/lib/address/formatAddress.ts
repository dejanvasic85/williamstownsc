import type { SiteSettings } from '@/sanity/sanity.types';

type Location = NonNullable<SiteSettings['locations']>[number];

export function formatAddress(location: Location | null | undefined): string {
	if (!location) return '';

	const parts = [
		location.streetAddress,
		location.addressLocality,
		location.addressRegion,
		location.postalCode
	].filter(Boolean);

	return parts.join(', ');
}
