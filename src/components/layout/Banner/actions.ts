'use server';

import { cookies } from 'next/headers';
import {
	dismissedAnnouncementsCookieName,
	getDismissedAnnouncementsFromCookie
} from '@/lib/announcements';

const cookieMaxAge = 60 * 60 * 24 * 365;

export async function dismissBanner(bannerId: string) {
	const cookieStore = await cookies();
	const dismissed = getDismissedAnnouncementsFromCookie(
		cookieStore.get(dismissedAnnouncementsCookieName)?.value
	);
	const updated = Array.from(new Set([...dismissed, bannerId]));

	cookieStore.set(dismissedAnnouncementsCookieName, JSON.stringify(updated), {
		maxAge: cookieMaxAge,
		path: '/',
		sameSite: 'lax'
	});
}
