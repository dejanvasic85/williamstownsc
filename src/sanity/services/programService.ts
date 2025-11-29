import { client } from '../lib/client';
import type { Program } from '../sanity.types';

export interface ProgramWithImage extends Omit<Program, 'image'> {
	imageUrl?: string;
	imageAlt?: string;
}

export async function getActivePrograms(): Promise<ProgramWithImage[]> {
	const query = `*[_type == "program" && active == true] | order(startDate asc) {
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

	return client.fetch(query);
}

export async function getFeaturedPrograms(limit = 3): Promise<ProgramWithImage[]> {
	const query = `*[_type == "program" && active == true] | order(startDate asc) [0...${limit}] {
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

	return client.fetch(query);
}
