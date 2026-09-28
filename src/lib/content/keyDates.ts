import { format } from 'date-fns';
import { groq } from 'next-sanity';
import { getSanityClient } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { Tenant } from '@/tenants/schema/tenantSchema';

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

export async function getNextKeyDate(tenant: Tenant): Promise<KeyDateItem | null> {
	const today = format(new Date(), 'yyyy-MM-dd');

	const data = await getSanityClient(tenant).fetch<KeyDateItem | null>(
		groq`*[_type == "keyDatesPage" && _id == "keyDatesPage"][0].keyDates[date >= $today] | order(date asc)[0]{
			title,
			date,
			description
		}`,
		{ today },
		{ next: { tags: ['page', 'keyDatesPage'] } }
	);

	return data;
}

export async function getKeyDatesPageData(tenant: Tenant): Promise<KeyDatesPageData | null> {
	const data = await getSanityClient(tenant).fetch<KeyDatesPageData>(
		groq`*[_type == "keyDatesPage" && _id == "keyDatesPage"][0]{
			heading,
			introduction,
			body,
			featuredImage {
				...,
				alt
			},
			keyDates[] | order(date asc) {
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
					url: urlFor(tenant.sanity, data.featuredImage).width(1200).height(600).fit('crop').url(),
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
								url: urlFor(tenant.sanity, data.seo.ogImage)
									.width(1200)
									.height(630)
									.fit('crop')
									.url(),
								alt: data.seo.ogImage.alt || ''
							}
						: undefined,
					noIndex: data.seo.noIndex || false
				}
			: undefined
	};
}
