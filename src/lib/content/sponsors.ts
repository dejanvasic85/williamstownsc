import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Sponsor, SponsorType } from '@/sanity/sanity.types';

type SponsorWithExpandedType = Omit<Sponsor, 'type'> & {
	type?: Pick<SponsorType, 'name' | 'order'> | null;
};

export type TransformedSponsor = Pick<Sponsor, '_id' | 'website'> & {
	name: string;
	logo: {
		url: string;
		alt?: string;
	};
	type: string;
	description: string;
};

function transformSponsor(sponsor: SponsorWithExpandedType): TransformedSponsor {
	return {
		_id: sponsor._id,
		name: sponsor.name || '',
		logo: {
			url: sponsor.logo ? urlFor(sponsor.logo).width(800).height(600).url() : '',
			alt: sponsor.logo?.alt
		},
		type: typeof sponsor.type === 'object' && sponsor.type?.name ? sponsor.type.name : '',
		description: sponsor.description || '',
		website: sponsor.website
	};
}

export async function getAllSponsors(): Promise<TransformedSponsor[]> {
	const query = `*[_type == "sponsor"] | order(order asc, name asc) {
		_id,
		name,
		logo,
		type->{
			name,
			order
		},
		description,
		location,
		contact,
		website
	}`;

	const sponsors = await client.fetch<SponsorWithExpandedType[]>(
		query,
		{},
		{ next: { tags: ['sponsor'] } }
	);

	return sponsors.map(transformSponsor);
}

export async function getFeaturedSponsors(limit: number = 3): Promise<TransformedSponsor[]> {
	const query = `*[_type == "sponsor"] | order(order asc, name asc) [0...$limit] {
		_id,
		name,
		logo,
		type->{
			name,
			order
		},
		description,
		location,
		contact,
		website
	}`;

	const sponsors = await client.fetch<SponsorWithExpandedType[]>(
		query,
		{ limit },
		{ next: { tags: ['sponsor'] } }
	);

	return sponsors.map(transformSponsor);
}
