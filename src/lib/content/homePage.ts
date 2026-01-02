import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';

export type KeyDatesSectionData = {
	show?: boolean;
	heading?: string;
	leadingText?: string;
};

type HomePageData = {
	keyDatesSection?: KeyDatesSectionData;
};

export async function getHomePageData(): Promise<HomePageData | null> {
	const query = groq`*[_type == "homePage" && _id == "homePage"][0]{
		keyDatesSection {
			show,
			heading,
			leadingText
		}
	}`;

	const data = await client.fetch<HomePageData>(
		query,
		{},
		{ next: { tags: ['page', 'homePage'] } }
	);

	return data;
}
