import { cache } from 'react';
import { getSanityClient } from '@/sanity/lib/client';
import { SiteSettings } from '@/sanity/sanity.types';
import type { Tenant } from '@/tenants/schema/tenantSchema';

/** Read the club's site settings from that club's own Sanity project. */
export async function getSiteSettings(tenant: Tenant) {
	const siteSettings = await getSanityClient(tenant).fetch<SiteSettings>(
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
			contact,
			matchday
		}`,
		{},
		{ next: { tags: ['siteSettings'] } }
	);

	return siteSettings;
}

/** The matchday club id fixture/table code compares against to identify "our" side. */
export const getMatchdayClubId = cache(async function getMatchdayClubId(
	tenant: Tenant
): Promise<string | null> {
	const siteSettings = await getSiteSettings(tenant);
	return siteSettings?.matchday?.clubId ?? null;
});
