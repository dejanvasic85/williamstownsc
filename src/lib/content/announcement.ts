import { parse } from 'date-fns';
import { client } from '@/sanity/lib/client';

export type AnnouncementType = 'info' | 'warning' | 'alert';

export interface AnnouncementData {
	_id: string;
	type: AnnouncementType;
	message: string;
	endDate: string;
}

export async function getAnnouncements(): Promise<AnnouncementData[]> {
	const announcements = await client.fetch<AnnouncementData[]>(
		`*[_type == "announcement"]{
			_id,
			type,
			message,
			endDate
		}`,
		{},
		{ next: { tags: ['announcement'] } }
	);

	return announcements.filter(
		(announcement) => parse(announcement.endDate, 'yyyy-MM-dd', new Date()) >= new Date()
	);
}
