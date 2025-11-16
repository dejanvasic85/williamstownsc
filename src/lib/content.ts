import { client } from '@/sanity/lib/client';
import { SiteSettings } from '@/sanity/sanity.types';

export async function getSiteSettings() {
	const siteSettings = await client.fetch<SiteSettings>(
		`*[_type == "siteSettings"][0]{
			_id,
			clubName,
			tagline,
			description,
			logo,
			locations,
			contact,
			seoDefaults,
			socials,
			seoDefaults,
			footerText,
			analytics
		}`
	);

	return siteSettings;
}
