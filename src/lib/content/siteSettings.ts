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
			seoDefaults,
			socials,
			seoDefaults,
			footerText,
			analytics,
			locations,
			contactEmails,
			canonicalUrl,
			foundingDate,
			contact
		}`,
		{},
		{ next: { tags: ['siteSettings'] } }
	);

	return siteSettings;
}
