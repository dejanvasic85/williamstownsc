import { cookies } from 'next/headers';
import { type AnnouncementData, getAnnouncements } from '@/lib/content';

export interface ActiveAnnouncementsResult {
	activeAnnouncements: AnnouncementData[];
	hasAnnouncements: boolean;
}

export async function getActiveAnnouncements(): Promise<ActiveAnnouncementsResult> {
	const [announcements, dismissedAnnouncements] = await Promise.all([
		getAnnouncements(),
		getDismissedAnnouncements()
	]);

	const activeAnnouncements = announcements.filter(
		(announcement) => !dismissedAnnouncements.includes(announcement._id)
	);

	return {
		activeAnnouncements,
		hasAnnouncements: activeAnnouncements.length > 0
	};
}

export const dismissedAnnouncementsCookieName = 'dismissed_announcements';

export async function getDismissedAnnouncements(): Promise<string[]> {
	const cookieStore = await cookies();
	return getDismissedAnnouncementsFromCookie(
		cookieStore.get(dismissedAnnouncementsCookieName)?.value
	);
}

export function getDismissedAnnouncementsFromCookie(cookieValue: string | undefined): string[] {
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
