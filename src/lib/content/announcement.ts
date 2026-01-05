import { format } from 'date-fns';
import { client } from '@/sanity/lib/client';

export type AnnouncementType = 'info' | 'warning' | 'alert';

export interface AnnouncementData {
	_id: string;
	type: AnnouncementType;
	message: string;
	endDate: string;
}

export async function getAnnouncements(): Promise<AnnouncementData[]> {
	const today = format(new Date(), 'yyyy-MM-dd');

	return await client.fetch<AnnouncementData[]>(
		`*[_type == "announcement" && endDate >= $today]{
			_id,
			type,
			message,
			endDate
		}`,
		{ today },
		{ next: { tags: ['announcement'] } }
	);
}
