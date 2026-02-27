import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { CommitteeMember } from '@/types/committee';

type CommitteePageData = {
	heading?: string;
	introduction?: unknown[];
	body?: unknown[];
	featuredImage?: {
		url: string;
		alt?: string;
	};
	committeeMembers?: CommitteeMember[];
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
	lastUpdated?: string;
};

export async function getCommitteePageData(): Promise<CommitteePageData | null> {
	const committeePageQuery = groq`*[_type == "committeePage" && _id == "committeePage"][0]{
		heading,
		introduction,
		body,
		featuredImage {
			...,
			alt
		},
		committeeMembers[] {
			person-> {
				_id,
				name,
				photo {
					asset-> {
						_ref,
						url
					},
					alt
				}
			},
			title,
			order
		},
		seo {
			...,
			ogImage {
				...,
				alt
			}
		},
		lastUpdated
	}`;

	const data = await client.fetch<CommitteePageData>(
		committeePageQuery,
		{},
		{ next: { tags: ['page', 'committeePage'] } }
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
		committeeMembers: data.committeeMembers,
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
			: undefined,
		lastUpdated: data.lastUpdated
	};
}
