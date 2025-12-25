import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/content';
import { urlFor } from '@/sanity/lib/image';

type StaticMetadataOptions = {
	title: string;
	description: string;
	keywords?: string[];
};

export async function generateStaticMetadata(options: StaticMetadataOptions): Promise<Metadata> {
	const siteSettings = await getSiteSettings();

	const titleSuffix = siteSettings?.seoDefaults?.titleSuffix || siteSettings?.clubName || '';
	const fullTitle = `${options.title} | ${titleSuffix}`;

	const ogImageUrl = siteSettings?.seoDefaults?.ogImage
		? urlFor(siteSettings.seoDefaults.ogImage).width(1200).height(630).url()
		: undefined;

	return {
		title: fullTitle,
		description: options.description,
		keywords: options.keywords || siteSettings?.seoDefaults?.keywords,
		openGraph: {
			title: fullTitle,
			description: options.description,
			images: ogImageUrl ? [{ url: ogImageUrl }] : [],
			siteName: siteSettings?.clubName || 'Williamstown SC',
			type: 'website'
		},
		twitter: {
			card: 'summary_large_image',
			title: fullTitle,
			description: options.description,
			images: ogImageUrl ? [ogImageUrl] : []
		}
	};
}
