import { getSanityClient } from '@/sanity/lib/client';
import type { Program } from '@/sanity/sanity.types';
import type { Tenant } from '@/tenants/schema/tenantSchema';

export interface ProgramWithImage extends Omit<Program, 'image'> {
	imageUrl?: string;
	imageAlt?: string;
}

const defaultFeaturedProgramLimitValue = 3;

function buildProgramsQuery(limit?: number): string {
	const limitClause = limit ? ` [0...$limit]` : '';

	return `*[_type == "program" && active == true] | order(startDate asc)${limitClause} {
		_id,
		name,
		slug,
		startDate,
		endDate,
		minAge,
		maxAge,
		description,
		"imageUrl": image.asset->url,
		"imageAlt": image.alt,
		active
	}`;
}

export async function getActivePrograms(
	tenant: Tenant,
	limit?: number
): Promise<ProgramWithImage[]> {
	const query = buildProgramsQuery(limit);
	const sanityClient = getSanityClient(tenant);

	return limit
		? sanityClient.fetch(query, { limit }, { next: { tags: ['program'] } })
		: sanityClient.fetch(query, {}, { next: { tags: ['program'] } });
}

export async function getFeaturedPrograms(
	tenant: Tenant,
	limit: number = defaultFeaturedProgramLimitValue
): Promise<ProgramWithImage[]> {
	return getActivePrograms(tenant, limit);
}
