import { groq } from 'next-sanity';
import { getSanityClient } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { Tenant } from '@/tenants/schema/tenantSchema';
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

export async function getCommitteePageData(tenant: Tenant): Promise<CommitteePageData | null> {
	const committeePageQuery = groq`*[_type == "committeePage" && _id == "committeePage"][0]{
		heading,
		introduction,
		body,
		featuredImage {
			...,
			alt
		},
		committeeMembers[] {
			photo {
				asset-> { _ref, url },
				alt,
				crop,
				hotspot
			},
			person-> {
				_id,
				name,
				photo {
					asset-> {
						_ref,
						url
					},
					alt,
					crop,
					hotspot
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

	const data = await getSanityClient(tenant).fetch<CommitteePageData>(
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
					url: urlFor(tenant.sanity, data.featuredImage).width(1200).height(600).fit('crop').url(),
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
			: undefined,
		lastUpdated: data.lastUpdated
	};
}
