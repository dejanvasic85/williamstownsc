import { MetadataRoute } from 'next';
import * as Sentry from '@sentry/nextjs';
import { getAllArticlesForSitemap } from '@/lib/content/news';
import { getSiteSettings } from '@/lib/content/siteSettings';
import { getAllTeamsForSitemap } from '@/lib/content/teams';
import logger from '@/lib/logger';

const log = logger.child({ module: 'sitemap' });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const siteSettings = await getSiteSettings();

	if (!siteSettings?.canonicalUrl) {
		throw new Error(
			'Canonical URL is not configured in site settings. Please configure it in Sanity CMS.'
		);
	}

	const baseUrl = siteSettings.canonicalUrl;

	const staticRoutesValue: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1.0
		},
		{
			url: `${baseUrl}/club`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8
		},
		{
			url: `${baseUrl}/club/about`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/club/committee`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.6
		},
		{
			url: `${baseUrl}/club/locations`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.6
		},
		{
			url: `${baseUrl}/club/policies-and-regulations`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.5
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/news`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9
		},
		{
			url: `${baseUrl}/key-dates`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8
		},
		{
			url: `${baseUrl}/sponsors`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.6
		},
		{
			url: `${baseUrl}/accessibility`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.3
		},
		{
			url: `${baseUrl}/privacy`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.3
		},
		{
			url: `${baseUrl}/terms`,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.3
		},
		{
			url: `${baseUrl}/menu`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.5
		},
		{
			url: `${baseUrl}/football`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.9
		},
		{
			url: `${baseUrl}/football/teams`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8
		},
		{
			url: `${baseUrl}/football/programs`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/football/merchandise`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.6
		}
	];

	try {
		const articles = await getAllArticlesForSitemap();
		const teams = await getAllTeamsForSitemap();

		const newsRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
			url: `${baseUrl}/news/${article.slug}`,
			lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.7
		}));

		const teamRoutes: MetadataRoute.Sitemap = teams.map((team) => ({
			url: `${baseUrl}/football/teams/${team.slug}`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.7
		}));

		log.info(
			{
				staticRoutes: staticRoutesValue.length,
				newsRoutes: newsRoutes.length,
				teamRoutes: teamRoutes.length
			},
			'sitemap generated'
		);

		return [...staticRoutesValue, ...newsRoutes, ...teamRoutes];
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'error generating dynamic sitemap routes');
		return staticRoutesValue;
	}
}

export const revalidate = 3600;
