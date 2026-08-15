import { cache } from 'react';
import { getSiteSettings } from '@/lib/content/siteSettings';

/** The matchday club id (`clb_...`) fixture/table rows compare against to identify "our" side —
 * the matchday-sourced equivalent of `getClubConfig().wscClubDriblId`. `cache()`-wrapped since
 * several call sites need this per request. */
export const getMatchdayClubId = cache(async function getMatchdayClubId(): Promise<string | null> {
	const siteSettings = await getSiteSettings();
	return siteSettings?.matchday?.clubId ?? null;
});
