import { client } from '@/sanity/lib/client';
import { NavigationSettings } from '@/sanity/sanity.types';

export interface NavigationVisibility {
	programs: boolean;
	merchandise: boolean;
	about: boolean;
	committee: boolean;
	policies: boolean;
	locations: boolean;
	sponsors: boolean;
	contact: boolean;
	keyDates: boolean;
	events: boolean;
}

export async function getNavigationVisibility(): Promise<NavigationVisibility> {
	const settings = await client.fetch<NavigationSettings>(
		`*[_type == "navigationSettings"][0]{
			programs,
			merchandise,
			about,
			committee,
			policies,
			locations,
			sponsors,
			contact,
			keyDates,
			events
		}`,
		{},
		{ next: { tags: ['navigationSettings'] } }
	);

	// Default all to true if settings don't exist yet
	return {
		programs: settings?.programs ?? true,
		merchandise: settings?.merchandise ?? true,
		about: settings?.about ?? true,
		committee: settings?.committee ?? true,
		policies: settings?.policies ?? true,
		locations: settings?.locations ?? true,
		sponsors: settings?.sponsors ?? true,
		contact: settings?.contact ?? true,
		keyDates: settings?.keyDates ?? true,
		events: settings?.events ?? true
	};
}
