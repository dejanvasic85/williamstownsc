import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Sponsor } from '@/sanity/sanity.types';

export type TransformedSponsor = Pick<Sponsor, '_id' | 'website'> & {
	name: string;
	logo: {
		url: string;
		alt?: string;
	};
	type: string;
	description: string;
};

function transformSponsor(sponsor: Sponsor): TransformedSponsor {
	return {
		_id: sponsor._id,
		name: sponsor.name || '',
		logo: {
			url: sponsor.logo ? urlFor(sponsor.logo).width(800).height(600).url() : '',
			alt: sponsor.logo?.alt
		},
		type: sponsor.type || '',
		description: sponsor.description || '',
		website: sponsor.website
	};
}

export async function getAllSponsors(): Promise<TransformedSponsor[]> {
	const query = `*[_type == "sponsor"] | order(order asc, name asc) {
		_id,
		name,
		logo,
		type,
		description,
		location,
		contact,
		website
	}`;

	const sponsors = await client.fetch<Sponsor[]>(query);

	return sponsors.map(transformSponsor);
}

export async function getFeaturedSponsors(limit: number = 3): Promise<TransformedSponsor[]> {
	const query = `*[_type == "sponsor"] | order(order asc, name asc) [0...$limit] {
		_id,
		name,
		logo,
		type,
		description,
		location,
		contact,
		website
	}`;

	const sponsors = await client.fetch<Sponsor[]>(query, { limit });

	return sponsors.map(transformSponsor);
}
