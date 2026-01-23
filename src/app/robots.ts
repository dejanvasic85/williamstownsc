import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/content/siteSettings';

export default async function robots(): Promise<MetadataRoute.Robots> {
	const siteSettings = await getSiteSettings();

	if (!siteSettings?.canonicalUrl) {
		throw new Error(
			'Canonical URL is not configured in site settings. Please configure it in Sanity CMS.'
		);
	}

	const baseUrl = siteSettings.canonicalUrl;

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/studio/', '/api/']
			}
		],
		sitemap: `${baseUrl}/sitemap.xml`
	};
}
