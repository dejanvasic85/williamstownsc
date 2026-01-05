import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';

export type KeyDateItem = {
	title: string;
	date: string;
	description?: string;
};

type KeyDatesPageData = {
	heading?: string;
	introduction?: unknown[];
	body?: unknown[];
	featuredImage?: {
		url: string;
		alt?: string;
	};
	keyDates?: KeyDateItem[];
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		keywords?: string[];
		ogTitle?: string;
		ogDescription?: string;
		ogImage?: {
			url: string;
			alt?: string;
		};
		noIndex?: boolean;
	};
};

export async function getKeyDatesPageData(): Promise<KeyDatesPageData | null> {
	const data = await client.fetch<KeyDatesPageData>(
		groq`*[_type == "keyDatesPage" && _id == "keyDatesPage"][0]{
  		heading,
  		introduction,
  		body,
  		featuredImage {
  			...,
  			alt
  		},
  		keyDates[] {
  			title,
  			date,
  			description
  		},
  		seo {
  			...,
  			ogImage {
  				...,
  				alt
  			}
  		}
  	}`,
		{},
		{ next: { tags: ['page', 'keyDatesPage'] } }
	);

	if (!data) {
		return null;
	}

	return {
		heading: data.heading || '',
		introduction: data.introduction,
		body: data.body,
		featuredImage: data.featuredImage
			? {
					url: urlFor(data.featuredImage).width(1200).height(600).url(),
					alt: data.featuredImage.alt || ''
				}
			: undefined,
		keyDates: data.keyDates,
		seo: data.seo
			? {
					metaTitle: data.seo.metaTitle || undefined,
					metaDescription: data.seo.metaDescription || undefined,
					keywords: data.seo.keywords || undefined,
					ogTitle: data.seo.ogTitle || undefined,
					ogDescription: data.seo.ogDescription || undefined,
					ogImage: data.seo.ogImage
						? {
								url: urlFor(data.seo.ogImage).width(1200).height(630).url(),
								alt: data.seo.ogImage.alt || ''
							}
						: undefined,
					noIndex: data.seo.noIndex || false
				}
			: undefined
	};
}
