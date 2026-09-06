import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/content/siteSettings';
import { buildUrl } from '@/lib/url/buildUrl';

export default async function robots(): Promise<MetadataRoute.Robots> {
	const siteSettings = await getSiteSettings();

	if (!siteSettings?.canonicalUrl) {
		throw new Error(
			'Canonical URL is not configured in site settings. Please configure it in Sanity CMS.'
		);
	}

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/studio/', '/api/']
			}
		],
		sitemap: buildUrl(siteSettings.canonicalUrl, 'sitemap.xml')
	};
}
