import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { HomePage } from '@/sanity/sanity.types';

export async function getHomePageData(): Promise<HomePage | null> {
	const data = await client.fetch<HomePage>(
		groq`*[_type == "homePage" && _id == "homePage"][0]{
	  keyDatesSection
	}`,
		{},
		{ next: { tags: ['page', 'homePage'] } }
	);

	return data;
}
