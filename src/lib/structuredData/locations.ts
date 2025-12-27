import type { SiteSettings } from '@/sanity/sanity.types';

type Location = NonNullable<SiteSettings['locations']>[number];

type LocationSchema = {
	'@context': string;
	'@type': string;
	name: string;
	address: {
		'@type': string;
		streetAddress?: string;
		addressLocality?: string;
		addressRegion?: string;
		postalCode?: string;
		addressCountry?: string;
	};
};

export function generateLocationSchema(location: Location): LocationSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'SportsActivityLocation',
		name: location.name || '',
		address: {
			'@type': 'PostalAddress',
			streetAddress: location.streetAddress,
			addressLocality: location.addressLocality,
			addressRegion: location.addressRegion,
			postalCode: location.postalCode,
			addressCountry: location.addressCountry || 'AU'
		}
	};
}

export function generateLocationsSchema(locations: SiteSettings['locations']): LocationSchema[] {
	if (!locations || locations.length === 0) return [];

	return locations.map((location) => generateLocationSchema(location));
}
