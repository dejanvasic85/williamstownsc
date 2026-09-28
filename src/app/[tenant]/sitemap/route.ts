import type { MetadataRoute } from 'next';
import * as Sentry from '@sentry/nextjs';
import { getAllArticlesForSitemap } from '@/lib/content/news';
import { getSiteSettings } from '@/lib/content/siteSettings';
import { getAllTeamsForSitemap } from '@/lib/content/teams';
import logger from '@/lib/logger';
import { buildUrl } from '@/lib/url/buildUrl';
import { escapeXml } from '@/lib/url/escapeXml';
import { getAllTenants, getTenantBySlug } from '@/tenants';

const log = logger.child({ module: 'sitemap' });

type SitemapRouteParams = {
	params: Promise<{ tenant: string }>;
};

export async function generateStaticParams() {
	return getAllTenants().map((tenant) => ({ tenant: tenant.slug }));
}

function buildSitemapXml(entries: MetadataRoute.Sitemap): string {
	const urls = entries
		.map((entry) => {
			const parts = [
				'<url>',
				`<loc>${escapeXml(entry.url)}</loc>`,
				`<lastmod>${new Date(entry.lastModified ?? new Date()).toISOString()}</lastmod>`
			];
			if (entry.changeFrequency) {
				parts.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
			}
			if (entry.priority !== undefined) {
				parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
			}
			parts.push('</url>');
			return parts.join('');
		})
		.join('');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export async function GET(_request: Request, { params }: SitemapRouteParams) {
	const { tenant: slug } = await params;
	const tenant = getTenantBySlug(slug);
	if (!tenant) {
		return new Response('Unknown tenant', { status: 404 });
	}
	const siteSettings = await getSiteSettings(tenant);

	if (!siteSettings?.canonicalUrl) {
		throw new Error(
			'Canonical URL is not configured in site settings. Please configure it in Sanity CMS.'
		);
	}

	const baseUrl = buildUrl(siteSettings.canonicalUrl);

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
		const articles = await getAllArticlesForSitemap(tenant);
		const teams = await getAllTeamsForSitemap(tenant);

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

		log.info({ tenant, staticRoutes: staticRoutesValue.length }, 'sitemap generated');

		return new Response(buildSitemapXml([...staticRoutesValue, ...newsRoutes, ...teamRoutes]), {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8'
			}
		});
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'error generating dynamic sitemap routes');
		return new Response(buildSitemapXml(staticRoutesValue), {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8'
			}
		});
	}
}

export const revalidate = 86400;
