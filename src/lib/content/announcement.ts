import { format } from 'date-fns';
import { getSanityClient } from '@/sanity/lib/client';
import type { Tenant } from '@/tenants/schema/tenantSchema';

export type AnnouncementType = 'info' | 'warning' | 'alert';

export interface AnnouncementData {
	_id: string;
	type: AnnouncementType;
	message: string;
	endDate: string;
}

export async function getAnnouncements(tenant: Tenant): Promise<AnnouncementData[]> {
	const today = format(new Date(), 'yyyy-MM-dd');

	return await getSanityClient(tenant).fetch<AnnouncementData[]>(
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
