import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata/buildMetadata';
import { urlFor } from '@/sanity/lib/image';

type StaticMetadataOptions = {
	title: string;
	description: string;
	keywords?: string[];
};

export async function generateStaticMetadata(options: StaticMetadataOptions): Promise<Metadata> {
	const siteSettings = await getSiteSettings();

	const titleSuffix = siteSettings?.seoDefaults?.titleSuffix || siteSettings?.clubName || '';

	const ogImage = siteSettings?.seoDefaults?.ogImage
		? {
				url: urlFor(siteSettings.seoDefaults.ogImage).width(1200).height(630).url(),
				alt: ''
			}
		: undefined;

	return buildMetadata({
		title: options.title,
		description: options.description,
		keywords: options.keywords || siteSettings?.seoDefaults?.keywords,
		ogImage,
		titleSuffix
	});
}
