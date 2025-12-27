import { urlFor } from '@/sanity/lib/image';
import type { SiteSettings } from '@/sanity/sanity.types';

type OrganizationSchema = {
	'@context': string;
	'@type': string;
	name: string;
	url: string;
	logo?: string;
	description?: string;
	foundingDate?: string;
	sport?: string;
	email?: string;
	telephone?: string;
	address?: {
		'@type': string;
		streetAddress?: string;
		addressLocality?: string;
		addressRegion?: string;
		postalCode?: string;
		addressCountry?: string;
	};
	sameAs?: string[];
};

export function generateOrganizationSchema(
	siteSettings: SiteSettings | null
): OrganizationSchema | null {
	if (!siteSettings) return null;

	const homeLocation = siteSettings.locations?.find((loc) => loc.facilityType === 'home');

	const logoUrl = siteSettings.logo
		? urlFor(siteSettings.logo).width(800).height(800).url()
		: undefined;

	const schema: OrganizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'SportsOrganization',
		sport: 'Soccer',
		name: siteSettings.clubName || '',
		url: siteSettings.canonicalUrl || ''
	};

	if (logoUrl) {
		schema.logo = logoUrl;
	}

	if (siteSettings.description) {
		schema.description = siteSettings.description;
	}

	if (siteSettings.foundingDate) {
		schema.foundingDate = siteSettings.foundingDate;
	}

	if (siteSettings.contact?.email) {
		schema.email = siteSettings.contact.email;
	}

	if (siteSettings.contact?.phone) {
		schema.telephone = siteSettings.contact.phone;
	}

	if (homeLocation) {
		schema.address = {
			'@type': 'PostalAddress',
			streetAddress: homeLocation.streetAddress,
			addressLocality: homeLocation.addressLocality,
			addressRegion: homeLocation.addressRegion,
			postalCode: homeLocation.postalCode,
			addressCountry: homeLocation.addressCountry || 'AU'
		};
	}

	const sameAs = Object.values(siteSettings.socials ?? {}).filter(
		(value): value is string => typeof value === 'string' && Boolean(value)
	);
	if (sameAs.length > 0) {
		schema.sameAs = sameAs;
	}

	return schema;
}
