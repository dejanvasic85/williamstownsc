import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { SiteSettings } from '@/sanity/sanity.types';

export type PageName =
	| 'aboutPage'
	| 'accessibilityPage'
	| 'committeePage'
	| 'contactPage'
	| 'locationsPage'
	| 'policiesPage'
	| 'privacyPage'
	| 'termsPage';

export interface PageData {
	heading: string;
	introduction?: unknown[];
	body?: unknown[];
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
	published?: boolean;
	lastUpdated?: string;
}

export interface PageMetadata {
	title: string;
	description?: string;
	keywords?: string[];
	openGraph?: {
		title: string;
		description?: string;
		images?: Array<{
			url: string;
			alt?: string;
		}>;
	};
	robots?: {
		index: boolean;
		follow: boolean;
	};
}

export async function getPageData(pageName: PageName): Promise<PageData | null> {
	const query = `*[_type == "${pageName}" && _id == "${pageName}"][0]{
		heading,
		introduction,
		body,
		featuredImage,
		seo,
		published,
		lastUpdated
	}`;

	const data = await client.fetch<PageData>(query);

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
					alt: (data.featuredImage as { alt?: string }).alt || ''
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
								alt: (data.seo.ogImage as { alt?: string }).alt || ''
							}
						: undefined,
					noIndex: data.seo.noIndex || false
				}
			: undefined,
		lastUpdated: data.lastUpdated
	};
}

export async function getPageMetadata(pageName: PageName): Promise<PageMetadata> {
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
	const title = pageData.seo?.metaTitle
		? `${pageData.seo.metaTitle} | ${titleSuffix}`
		: `${pageData.heading} | ${titleSuffix}`;

	const description =
		pageData.seo?.metaDescription || siteSettings?.seoDefaults?.siteDescription || undefined;

	const ogTitle = pageData.seo?.ogTitle || pageData.seo?.metaTitle || pageData.heading;
	const ogDescription = pageData.seo?.ogDescription || pageData.seo?.metaDescription || description;

	const ogImages = pageData.seo?.ogImage
		? [{ url: pageData.seo.ogImage.url, alt: pageData.seo.ogImage.alt }]
		: pageData.featuredImage
			? [{ url: pageData.featuredImage.url, alt: pageData.featuredImage.alt }]
			: siteSettings?.seoDefaults?.ogImage
				? [
						{
							url: urlFor(siteSettings.seoDefaults.ogImage).width(1200).height(630).url(),
							alt: ''
						}
					]
				: undefined;

	return {
		title,
		description,
		keywords: pageData.seo?.keywords || siteSettings?.seoDefaults?.keywords || undefined,
		openGraph: {
			title: `${ogTitle} | ${titleSuffix}`,
			description: ogDescription,
			images: ogImages
		},
		robots: {
			index: !pageData.seo?.noIndex,
			follow: !pageData.seo?.noIndex
		}
	};
}
