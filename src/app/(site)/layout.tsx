import { Navbar } from '@/components/layout';

import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getSiteSettings();

	return {
		title: siteSettings?.seoDefaults?.siteTitle,
		description: siteSettings?.seoDefaults?.siteDescription,
		keywords: siteSettings?.seoDefaults?.keywords
	};
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const siteSettings = await getSiteSettings();
	console.log('siteSettings', siteSettings);

	return (
		<>
			<Navbar />
			<main>{children}</main>
		</>
	);
}
