import { getSiteSettings } from '@/lib/content/siteSettings';
import { buildUrl } from '@/lib/url/buildUrl';
import { getAllTenants, getTenantBySlug } from '@/tenants';

type RobotsRouteParams = {
	params: Promise<{ tenant: string }>;
};

export async function generateStaticParams() {
	return getAllTenants().map((tenant) => ({ tenant: tenant.slug }));
}

export async function GET(_request: Request, { params }: RobotsRouteParams) {
	const { tenant: slug } = await params;
	const tenant = getTenantBySlug(slug);
	if (!tenant) {
		return new Response('Unknown tenant', { status: 404 });
	}

	const siteSettings = await getSiteSettings();
	if (!siteSettings?.canonicalUrl) {
		throw new Error(
			'Canonical URL is not configured in site settings. Please configure it in Sanity CMS.'
		);
	}

	const body = `User-agent: *
Allow: /
Disallow: /studio/
Disallow: /api/

Sitemap: ${buildUrl(siteSettings.canonicalUrl, 'sitemap.xml')}
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8'
		}
	});
}

export const revalidate = 86400;
