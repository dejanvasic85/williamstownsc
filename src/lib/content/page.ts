import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata/buildMetadata';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type {
	AboutPage,
	AccessibilityPage,
	CommitteePage,
	ContactPage,
	LocationsPage,
	MerchandisePage,
	PoliciesPage,
	PrivacyPage,
	SiteSettings,
	TermsPage
} from '@/sanity/sanity.types';

export type PageName =
	| 'aboutPage'
	| 'accessibilityPage'
	| 'committeePage'
	| 'contactPage'
	| 'locationsPage'
	| 'merchandisePage'
	| 'policiesPage'
	| 'privacyPage'
	| 'termsPage';

type PageType =
	| AboutPage
	| AccessibilityPage
	| CommitteePage
	| ContactPage
	| LocationsPage
	| MerchandisePage
	| PoliciesPage
	| PrivacyPage
	| TermsPage;

export type PageData = Pick<PageType, 'heading' | 'introduction' | 'body' | 'published'> & {
	featuredImage?: {
		url: string;
		alt?: string;
	};
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

export async function getPageData(pageName: PageName): Promise<PageData | null> {
	const query = `*[_type == $pageName && _id == $pageId][0]{
		heading,
		introduction,
		body,
		featuredImage {
			...,
			alt
		},
		seo {
			...,
			ogImage {
				...,
				alt
			}
		},
		published,
		lastUpdated
	}`;

	const data = await client.fetch<PageData>(query, { pageName, pageId: pageName });

	if (!data || !data.published) {
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

export async function getContactPageData() {
	const query = `*[_type == "contactPage" && _id == "contactPage"][0]{
		heading,
		introduction,
		playerContent {
			heading,
			introduction,
			image { ..., alt },
			ctaText
		},
		coachContent {
			heading,
			introduction,
			image { ..., alt },
			ctaText
		},
		sponsorContent {
			heading,
			introduction,
			image { ..., alt },
			ctaText
		},
		programContent {
			heading,
			introduction,
			image { ..., alt },
			ctaText
		},
		generalContent {
			heading,
			introduction,
			image { ..., alt },
			ctaText
		},
		seo {
			...,
			ogImage { ..., alt }
		},
		published
	}`;

	const data = await client.fetch(query);

	if (!data || !data.published) {
		return null;
	}

	return data;
}

export async function getPageMetadata(pageName: PageName): Promise<Metadata> {
	const [pageData, siteSettings] = await Promise.all([
		getPageData(pageName),
		client.fetch<SiteSettings>(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
			clubName,
			seoDefaults {
				siteTitle,
				titleSuffix,
				siteDescription,
				keywords,
				ogImage
			}
		}`)
	]);

	if (!pageData) {
		return {
			title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
			description: `${pageName} page`
		};
	}

	const titleSuffix = siteSettings?.seoDefaults?.titleSuffix || siteSettings?.clubName || '';
	const title = pageData.seo?.metaTitle || pageData.heading || pageName;
	const description = pageData.seo?.metaDescription || siteSettings?.seoDefaults?.siteDescription;

	const ogImage = pageData.seo?.ogImage
		? { url: pageData.seo.ogImage.url, alt: pageData.seo.ogImage.alt }
		: pageData.featuredImage
			? { url: pageData.featuredImage.url, alt: pageData.featuredImage.alt }
			: siteSettings?.seoDefaults?.ogImage
				? {
						url: urlFor(siteSettings.seoDefaults.ogImage).width(1200).height(630).url(),
						alt: ''
					}
				: undefined;

	return buildMetadata({
		title,
		description,
		keywords: pageData.seo?.keywords || siteSettings?.seoDefaults?.keywords || undefined,
		ogImage,
		titleSuffix,
		robots: {
			index: !pageData.seo?.noIndex,
			follow: !pageData.seo?.noIndex
		}
	});
}
