'use server';

import { cookies } from 'next/headers';

const dismissedBannersCookieName = 'dismissed_banners';
const cookieMaxAge = 60 * 60 * 24 * 365;

export async function dismissBanner(bannerId: string) {
	const cookieStore = await cookies();
	const dismissed = getDismissedBannersFromCookie(
		cookieStore.get(dismissedBannersCookieName)?.value
	);
	const updated = Array.from(new Set([...dismissed, bannerId]));

	cookieStore.set(dismissedBannersCookieName, JSON.stringify(updated), {
		maxAge: cookieMaxAge,
		path: '/',
		sameSite: 'lax'
	});
}

export async function getDismissedBanners(): Promise<string[]> {
	const cookieStore = await cookies();
	return getDismissedBannersFromCookie(cookieStore.get(dismissedBannersCookieName)?.value);
}

function getDismissedBannersFromCookie(cookieValue: string | undefined): string[] {
	if (!cookieValue) {
		return [];
	}

	try {
		const parsed = JSON.parse(cookieValue);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
