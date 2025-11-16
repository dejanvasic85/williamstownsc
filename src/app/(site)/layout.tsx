import { Navbar } from '@/components/layout';

import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/content';
import { urlFor } from '@/sanity/lib/image';

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

	const logoUrl = siteSettings?.logo
		? urlFor(siteSettings.logo).width(80).height(80).url()
		: undefined;
	const logoAlt = siteSettings?.logo?.alt;

	return (
		<>
			<Navbar
				logoUrl={logoUrl}
				logoAlt={logoAlt}
				clubName={siteSettings?.clubName}
				socials={siteSettings?.socials}
			/>
			<main>{children}</main>
		</>
	);
}
