import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Program, SiteSettings } from '@/sanity/sanity.types';

export interface TransformedProgram {
	_id: string;
	name: string;
	slug: string;
	startDate: string;
	endDate: string;
	minAge: number;
	maxAge: number;
	image?: {
		url: string;
		alt?: string;
	};
	description?: string;
}

export async function getSiteSettings() {
	const siteSettings = await client.fetch<SiteSettings>(
		`*[_type == "siteSettings"][0]{
			_id,
			clubName,
			tagline,
			description,
			logo,
			seoDefaults,
			socials,
			seoDefaults,
			footerText,
			analytics
		}`
	);

	return siteSettings;
}

export async function getActivePrograms(): Promise<TransformedProgram[]> {
	const query = `*[_type == "program" && active == true] | order(startDate desc) {
		_id,
		name,
		slug,
		startDate,
		endDate,
		minAge,
		maxAge,
		image,
		description
	}`;

	const programs = await client.fetch<Program[]>(query);

	return programs.map(
		(program): TransformedProgram => ({
			_id: program._id,
			name: program.name || '',
			slug: program.slug?.current || '',
			startDate: program.startDate || '',
			endDate: program.endDate || '',
			minAge: program.minAge || 0,
			maxAge: program.maxAge || 0,
			image: program.image
				? {
						url: urlFor(program.image).width(800).height(600).url(),
						alt: program.image.alt
					}
				: undefined,
			description: program.description
		})
	);
}
