import { getSanityClient } from '@/sanity/lib/client';
import { type SanityImageProject, urlFor } from '@/sanity/lib/image';
import { Sponsor } from '@/sanity/sanity.types';
import type { Tenant } from '@/tenants/schema/tenantSchema';

type CardSize = 'large' | 'medium' | 'small';

type SponsorTypeReference = {
	_id?: string;
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
	_id: string;
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

function transformSponsor(
	sanity: SanityImageProject,
	sponsor: SponsorWithExpandedType
): TransformedSponsor {
	return {
		_id: sponsor._id,
		name: sponsor.name || '',
		logo: {
			url: sponsor.logo
				? urlFor(sanity, sponsor.logo).width(400).height(300).fit('crop').url()
				: '',
			alt: sponsor.logo?.alt
		},
		type: sponsor.type?.name ?? '',
		description: sponsor.description || '',
		website: sponsor.website
	};
}

function groupSponsorsByTier(
	sanity: SanityImageProject,
	sponsors: SponsorWithExpandedType[]
): SponsorTier[] {
	const tierMap = new Map<string, SponsorTier>();

	for (const sponsor of sponsors) {
		const tierId = sponsor.type?._id ?? 'other';
		const existing = tierMap.get(tierId);

		if (existing) {
			existing.sponsors.push(transformSponsor(sanity, sponsor));
		} else {
			tierMap.set(tierId, {
				_id: tierId,
				name: sponsor.type?.name ?? 'Other',
				order: sponsor.type?.order ?? 999,
				description: sponsor.type?.description ?? '',
				cardSize: sponsor.type?.cardSize ?? 'medium',
				sponsors: [transformSponsor(sanity, sponsor)]
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
		_id,
		name,
		order,
		description,
		cardSize
	},
	description,
	website
`;

export async function getAllSponsors(tenant: Tenant): Promise<TransformedSponsor[]> {
	const query = `*[_type == "sponsor"] | order(order asc, name asc) {
		${sponsorFields}
	}`;

	const sponsors = await getSanityClient(tenant).fetch<SponsorWithExpandedType[]>(
		query,
		{},
		{ next: { tags: ['sponsor', 'sponsorType'] } }
	);

	return sponsors.map((sponsor) => transformSponsor(tenant.sanity, sponsor));
}

export async function getFeaturedSponsors(tenant: Tenant): Promise<TransformedSponsor[]> {
	const query = `*[_type == "sponsor" && showOnHomepage == true] | order(order asc, name asc) {
		${sponsorFields}
	}`;

	const sponsors = await getSanityClient(tenant).fetch<SponsorWithExpandedType[]>(
		query,
		{},
		{ next: { tags: ['sponsor', 'sponsorType'] } }
	);

	return sponsors.map((sponsor) => transformSponsor(tenant.sanity, sponsor));
}

export async function getSponsorsGroupedByTier(tenant: Tenant): Promise<SponsorTier[]> {
	const query = `*[_type == "sponsor"] | order(type->order asc, order asc, name asc) {
		${sponsorFields}
	}`;

	const sponsors = await getSanityClient(tenant).fetch<SponsorWithExpandedType[]>(
		query,
		{},
		{ next: { tags: ['sponsor', 'sponsorType'] } }
	);

	return groupSponsorsByTier(tenant.sanity, sponsors);
}

export async function getAllSponsorTypes(tenant: Tenant): Promise<SponsorTypeData[]> {
	const query = `*[_type == "sponsorType"] | order(order asc) {
		name,
		description,
		order
	}`;

	return getSanityClient(tenant).fetch<SponsorTypeData[]>(
		query,
		{},
		{ next: { tags: ['sponsorType'] } }
	);
}
