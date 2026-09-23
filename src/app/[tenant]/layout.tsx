import type { Metadata } from 'next';
import { Suspense } from 'react';
import clsx from 'clsx';
import '@/app/globals.css';
import { GoogleTagManager, PageViewTracker } from '@/components/analytics';
import { getClientConfig, isLocal } from '@/lib/config';
import { getSiteSettings } from '@/lib/content';
import { exo, outfit } from '@/lib/fonts';
import { ConfigProvider } from '@/lib/providers/ConfigProvider';
import { getAllTenants, getTenantBySlug } from '@/tenants';

export const metadata: Metadata = {
	manifest: '/manifest.webmanifest',
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: '48x48' },
			{ url: '/icon.svg', type: 'image/svg+xml' }
		],
		apple: '/apple-icon.png'
	}
};

type TenantLayoutProps = Readonly<{
	children: React.ReactNode;
	params: Promise<{ tenant: string }>;
}>;

export async function generateStaticParams() {
	return getAllTenants().map((tenant) => ({ tenant: tenant.slug }));
}

// Rule 3: only slugs generated above can render, so an unregistered slug cannot.
export const dynamicParams = false;

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
	const { tenant: tenantSlug } = await params;
	const tenant = getTenantBySlug(tenantSlug);
	if (!tenant) {
		throw new Error(`Unknown tenant: ${tenantSlug}`);
	}
	const config = getClientConfig();
	const siteSettings = await getSiteSettings(tenant);

	// Only load GTM in production with valid GTM ID
	const gtmId = siteSettings?.analytics?.gtmId;
	const shouldLoadGtm = !isLocal() && !!gtmId;

	return (
		<html lang="en" data-tenant={tenantSlug}>
			{shouldLoadGtm && gtmId && <GoogleTagManager gtmId={gtmId} />}
			<body className={clsx(outfit.variable, exo.variable, 'antialiased')}>
				<ConfigProvider config={config}>{children}</ConfigProvider>
				{shouldLoadGtm && (
					<Suspense fallback={null}>
						<PageViewTracker />
					</Suspense>
				)}
			</body>
		</html>
	);
}
