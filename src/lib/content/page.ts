import type { Metadata } from 'next';
import type { SanityImageSource } from '@sanity/image-url';
import { buildMetadata } from '@/lib/metadata/buildMetadata';
import { getSanityClient } from '@/sanity/lib/client';
import { type SanityImageProject, urlFor } from '@/sanity/lib/image';
import type { SiteSettings } from '@/sanity/sanity.types';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { getSiteSettings } from './siteSettings';

export type PageName =
	| 'aboutPage'
	| 'accessibilityPage'
	| 'committeePage'
	| 'contactPage'
	| 'homePage'
	| 'keyDatesPage'
	| 'locationsPage'
	| 'merchandisePage'
	| 'newsPage'
	| 'policiesPage'
	| 'privacyPage'
	| 'programsPage'
	| 'sponsorsPage'
	| 'teamsPage'
	| 'termsPage';

export type PageData = {
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

export type EditablePageData = PageData & {
	heading?: string;
	introduction?: unknown[];
	body?: unknown[];
	featuredImage?: {
		url: string;
		alt?: string;
	};
	lastUpdated?: string;
};

export async function getPageData(
	tenant: Tenant,
	pageName: PageName
): Promise<EditablePageData | null> {
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
		lastUpdated
	}`;

	const data = await getSanityClient(tenant).fetch<EditablePageData>(
		query,
		{ pageName, pageId: pageName },
		{ next: { tags: ['page', pageName] } }
	);

	if (!data) {
		return null;
	}

	return {
		heading: data.heading || '',
		introduction: data.introduction,
		body: data.body,
		featuredImage: data.featuredImage
			? processImage(tenant.sanity, data.featuredImage, 1200, 600)
			: undefined,
		seo: data.seo
			? {
					metaTitle: data.seo.metaTitle || undefined,
					metaDescription: data.seo.metaDescription || undefined,
					keywords: data.seo.keywords || undefined,
					ogTitle: data.seo.ogTitle || undefined,
					ogDescription: data.seo.ogDescription || undefined,
					ogImage: data.seo.ogImage
						? processImage(tenant.sanity, data.seo.ogImage, 1200, 630)
						: undefined,
					noIndex: data.seo.noIndex || false
				}
			: undefined,
		lastUpdated: data.lastUpdated
	};
}

export async function getContactPageData(tenant: Tenant) {
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
		}
	}`;

	const data = await getSanityClient(tenant).fetch(
		query,
		{},
		{ next: { tags: ['page', 'contactPage'] } }
	);

	if (!data) {
		return null;
	}

	return data;
}

function processImage(
	sanity: SanityImageProject,
	image: SanityImageSource & { alt?: string },
	width: number,
	height: number
) {
	return {
		url: urlFor(sanity, image).width(width).height(height).fit('crop').url(),
		alt: image.alt
	};
}

function processSeoWithOgImage(sanity: SanityImageProject, seo: PageData['seo']): PageData['seo'] {
	if (!seo?.ogImage) {
		return seo;
	}

	return {
		...seo,
		ogImage: processImage(sanity, seo.ogImage, 1200, 630)
	};
}

function buildPageMetadata(
	pageData: PageData | EditablePageData | null,
	siteSettings: SiteSettings | null,
	pageName: PageName,
	sanity: SanityImageProject
): Metadata {
	if (!pageData) {
		return {
			title: pageName.charAt(0).toUpperCase() + pageName.slice(1),
			description: `${pageName} page`
		};
	}

	const titleSuffix = siteSettings?.seoDefaults?.titleSuffix || siteSettings?.clubName || '';
	const editablePageData = pageData as EditablePageData;
	const title = pageData.seo?.metaTitle || editablePageData.heading || pageName;
	const description = pageData.seo?.metaDescription || siteSettings?.seoDefaults?.siteDescription;

	const ogImage = pageData.seo?.ogImage
		? { url: pageData.seo.ogImage.url, alt: pageData.seo.ogImage.alt }
		: editablePageData.featuredImage
			? { url: editablePageData.featuredImage.url, alt: editablePageData.featuredImage.alt }
			: siteSettings?.seoDefaults?.ogImage
				? {
						url: urlFor(sanity, siteSettings.seoDefaults.ogImage)
							.width(1200)
							.height(630)
							.fit('crop')
							.url(),
						alt: ''
					}
				: undefined;

	return buildMetadata({
		title,
		description,
		ogImage,
		titleSuffix,
		robots: {
			index: !pageData.seo?.noIndex,
			follow: !pageData.seo?.noIndex
		}
	});
}

export async function getPageMetadata(tenant: Tenant, pageName: PageName): Promise<Metadata> {
	const pageDataQuery = `*[_type == $pageName && _id == $pageId][0]{
		seo {
			...,
			ogImage { ..., alt }
		}
	}`;

	const [pageData, siteSettings] = await Promise.all([
		getSanityClient(tenant).fetch<PageData>(pageDataQuery, { pageName, pageId: pageName }),
		getSiteSettings(tenant)
	]);

	const processedPageData: PageData | null = pageData
		? { ...pageData, seo: processSeoWithOgImage(tenant.sanity, pageData.seo) }
		: null;

	return buildPageMetadata(processedPageData, siteSettings, pageName, tenant.sanity);
}

export async function getEditablePageMetadata(
	tenant: Tenant,
	pageName: PageName
): Promise<Metadata> {
	const pageDataQuery = `*[_type == $pageName && _id == $pageId][0]{
		heading,
		featuredImage { ..., alt },
		seo {
			...,
			ogImage { ..., alt }
		}
	}`;

	const [pageData, siteSettings] = await Promise.all([
		getSanityClient(tenant).fetch<EditablePageData>(
			pageDataQuery,
			{ pageName, pageId: pageName },
			{ next: { tags: ['page', pageName] } }
		),
		getSiteSettings(tenant)
	]);

	const processedPageData: EditablePageData | null = pageData
		? {
				...pageData,
				featuredImage: pageData.featuredImage
					? processImage(tenant.sanity, pageData.featuredImage, 1200, 630)
					: undefined,
				seo: processSeoWithOgImage(tenant.sanity, pageData.seo)
			}
		: null;

	return buildPageMetadata(processedPageData, siteSettings, pageName, tenant.sanity);
}
