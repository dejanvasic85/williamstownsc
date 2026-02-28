import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Sponsor } from '@/sanity/sanity.types';

type CardSize = 'large' | 'medium' | 'small';

type SponsorTypeReference = {
	name?: string;
	order?: number;
	description?: string;
	cardSize?: CardSize;
};

type SponsorWithExpandedType = Omit<Sponsor, 'type'> & {
	type?: SponsorTypeReference | null;
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

export type SponsorTier = {
	name: string;
	order: number;
	description: string;
	cardSize: CardSize;
	sponsors: TransformedSponsor[];
};

export type SponsorTypeData = {
	name: string;
	description: string;
	order: number;
};

function transformSponsor(sponsor: SponsorWithExpandedType): TransformedSponsor {
	return {
		_id: sponsor._id,
		name: sponsor.name || '',
		logo: {
			url: sponsor.logo ? urlFor(sponsor.logo).width(800).height(600).url() : '',
			alt: sponsor.logo?.alt
		},
		type: sponsor.type?.name ?? '',
		description: sponsor.description || '',
		website: sponsor.website
	};
}

function groupSponsorsByTier(sponsors: SponsorWithExpandedType[]): SponsorTier[] {
	const tierMap = new Map<string, SponsorTier>();

	for (const sponsor of sponsors) {
		const tierName = sponsor.type?.name ?? 'Other';
		const existing = tierMap.get(tierName);

		if (existing) {
			existing.sponsors.push(transformSponsor(sponsor));
		} else {
			tierMap.set(tierName, {
				name: tierName,
				order: sponsor.type?.order ?? 999,
				description: sponsor.type?.description ?? '',
				cardSize: sponsor.type?.cardSize ?? 'medium',
				sponsors: [transformSponsor(sponsor)]
			});
		}
	}

	return Array.from(tierMap.values()).sort((a, b) => a.order - b.order);
}

const sponsorFields = `
	_id,
	name,
	logo,
	type->{
		name,
		order,
		description,
		cardSize
	},
	description,
	website
`;

export async function getAllSponsors(): Promise<TransformedSponsor[]> {
	const query = `*[_type == "sponsor"] | order(order asc, name asc) {
		${sponsorFields}
	}`;

	const sponsors = await client.fetch<SponsorWithExpandedType[]>(
		query,
		{},
		{ next: { tags: ['sponsor', 'sponsorType'] } }
	);

	return sponsors.map(transformSponsor);
}

export async function getFeaturedSponsors(): Promise<TransformedSponsor[]> {
	const query = `*[_type == "sponsor" && showOnHomepage == true] | order(order asc, name asc) {
		${sponsorFields}
	}`;

	const sponsors = await client.fetch<SponsorWithExpandedType[]>(
		query,
		{},
		{ next: { tags: ['sponsor', 'sponsorType'] } }
	);

	return sponsors.map(transformSponsor);
}

export async function getSponsorsGroupedByTier(): Promise<SponsorTier[]> {
	const query = `*[_type == "sponsor"] | order(type->order asc, order asc, name asc) {
		${sponsorFields}
	}`;

	const sponsors = await client.fetch<SponsorWithExpandedType[]>(
		query,
		{},
		{ next: { tags: ['sponsor', 'sponsorType'] } }
	);

	return groupSponsorsByTier(sponsors);
}

export async function getAllSponsorTypes(): Promise<SponsorTypeData[]> {
	const query = `*[_type == "sponsorType"] | order(order asc) {
		name,
		description,
		order
	}`;

	return client.fetch<SponsorTypeData[]>(query, {}, { next: { tags: ['sponsorType'] } });
}
