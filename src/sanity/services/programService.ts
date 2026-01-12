import { client } from '@/sanity/lib/client';
import type { Program } from '@/sanity/sanity.types';

export interface ProgramWithImage extends Omit<Program, 'image'> {
	imageUrl?: string;
	imageAlt?: string;
}

const DEFAULT_FEATURED_PROGRAM_LIMIT = 3;

export async function getActivePrograms(limit?: number): Promise<ProgramWithImage[]> {
	const query = limit
		? `*[_type == "program" && active == true] | order(startDate asc) [0...$limit] {
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
			}`
		: `*[_type == "program" && active == true] | order(startDate asc) {
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

	return limit
		? client.fetch(query, { limit }, { next: { tags: ['program'] } })
		: client.fetch(query, {}, { next: { tags: ['program'] } });
}

export async function getFeaturedPrograms(
	limit: number = DEFAULT_FEATURED_PROGRAM_LIMIT
): Promise<ProgramWithImage[]> {
	return getActivePrograms(limit);
}
