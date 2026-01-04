import { client } from '@/sanity/lib/client';

export type AnnouncementType = 'info' | 'warning' | 'alert';

export interface AnnouncementData {
	_id: string;
	title?: string;
	enabled: boolean;
	type: AnnouncementType;
	order: number;
	message: string;
	link?: {
		text?: string;
		url?: string;
	};
}

export async function getAnnouncements(): Promise<AnnouncementData[]> {
	const announcements = await client.fetch<AnnouncementData[]>(
		`*[_type == "announcement" && enabled == true && defined(message)] | order(order asc){
			_id,
			title,
			enabled,
			type,
			order,
			message,
			link
		}`,
		{},
		{ next: { tags: ['announcement'] } }
	);

	return announcements || [];
}
