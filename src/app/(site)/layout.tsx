import { Footer, Navbar } from '@/components/layout';

import { getSiteSettings } from '@/lib/content';
import { urlFor } from '@/sanity/lib/image';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getSiteSettings();

	const ogImageUrl = siteSettings?.seoDefaults?.ogImage
		? urlFor(siteSettings.seoDefaults.ogImage).width(1200).height(630).url()
		: undefined;

	const title = siteSettings?.seoDefaults?.siteTitle || 'Williamstown SC';
	const description =
		siteSettings?.seoDefaults?.siteDescription || 'Official website of Williamstown Soccer Club';

	return {
		title,
		description,
		keywords: siteSettings?.seoDefaults?.keywords,
		openGraph: {
			title,
			description,
			images: ogImageUrl ? [{ url: ogImageUrl }] : [],
			siteName: siteSettings?.clubName || 'Williamstown SC',
			type: 'website'
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: ogImageUrl ? [ogImageUrl] : []
		}
	};
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const siteSettings = await getSiteSettings();

	const logoUrl = siteSettings?.logo
		? urlFor(siteSettings.logo).width(80).height(80).url()
		: undefined;
	const logoAlt = siteSettings?.logo?.alt;

	const homeGround = siteSettings?.locations?.find(
		(location: { facilityType?: string }) => location.facilityType === 'home'
	);
	const homeGroundLink = homeGround?.mapLink
		? homeGround.mapLink
		: homeGround?.address
			? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homeGround.address)}`
			: undefined;

	return (
		<>
			<Navbar
				logoUrl={logoUrl}
				logoAlt={logoAlt}
				clubName={siteSettings?.clubName}
				socials={siteSettings?.socials}
				homeGroundLink={homeGroundLink}
			/>
			<main>{children}</main>
			<Footer clubName={siteSettings?.clubName} socials={siteSettings?.socials} />
		</>
	);
}
