import { cache } from 'react';
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
			contact,
			matchday
		}`,
		{},
		{ next: { tags: ['siteSettings'] } }
	);

	return siteSettings;
}

/** The matchday club id (`clb_...`) fixture/table code compares against to identify "our" side —
 * the matchday-sourced equivalent of `getClubConfig().wscClubDriblId`. `cache()`-wrapped since
 * several call sites need this per request. */
export const getMatchdayClubId = cache(async function getMatchdayClubId(): Promise<string | null> {
	const siteSettings = await getSiteSettings();
	return siteSettings?.matchday?.clubId ?? null;
});
