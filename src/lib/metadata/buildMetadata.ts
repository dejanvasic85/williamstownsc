import type { Metadata } from 'next';

type BuildMetadataOptions = {
	title: string;
	description?: string;
	keywords?: string[];
	ogImage?: {
		url: string;
		alt?: string;
	};
	titleSuffix: string;
	robots?: {
		index: boolean;
		follow: boolean;
	};
};

export function buildMetadata(options: BuildMetadataOptions): Metadata {
	const { title, description, keywords, ogImage, titleSuffix, robots } = options;

	const fullTitle = `${title} | ${titleSuffix}`;

	return {
		title: fullTitle,
		description,
		keywords,
		openGraph: {
			title: fullTitle,
			description,
			images: ogImage ? [{ url: ogImage.url, alt: ogImage.alt }] : [],
			type: 'website'
		},
		twitter: {
			card: 'summary_large_image',
			title: fullTitle,
			description,
			images: ogImage ? [ogImage.url] : []
		},
		robots
	};
}
