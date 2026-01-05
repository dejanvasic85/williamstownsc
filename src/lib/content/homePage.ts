import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';

type HomePageData = Record<string, never>;

export async function getHomePageData(): Promise<HomePageData | null> {
	const query = groq`*[_type == "homePage" && _id == "homePage"][0]{}`;

	const data = await client.fetch<HomePageData>(
		query,
		{},
		{ next: { tags: ['page', 'homePage'] } }
	);

	return data;
}
