import { getSiteSettings } from '@/lib/content/siteSettings';
import { getAllTenants, getTenantBySlug } from '@/tenants';
import type { Tenant } from '@/tenants/schema/tenantSchema';

type ManifestRouteParams = {
	params: Promise<{ tenant: string }>;
};

export async function generateStaticParams() {
	return getAllTenants().map((tenant) => ({ tenant: tenant.slug }));
}

type ManifestIcon = {
	src: string;
	sizes: string;
	type: string;
	purpose: 'any' | 'maskable' | 'monochrome';
};

const manifestIconsValue: ManifestIcon[] = [
	{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
	{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
];

function buildManifest(tenant: Tenant, clubName: string): string {
	return JSON.stringify({
		name: clubName,
		short_name: clubName,
		icons: manifestIconsValue,
		theme_color: tenant.theme.light.primary,
		background_color: '#ffffff',
		display: 'standalone'
	});
}

export async function GET(_request: Request, { params }: ManifestRouteParams) {
	const { tenant: slug } = await params;
	const tenant = getTenantBySlug(slug);
	if (!tenant) {
		return new Response('Unknown tenant', { status: 404 });
	}

	const siteSettings = await getSiteSettings();
	const clubName = siteSettings?.clubName ?? tenant.slug;

	return new Response(buildManifest(tenant, clubName), {
		headers: {
			'Content-Type': 'application/manifest+json; charset=utf-8'
		}
	});
}

export const revalidate = 86400;
