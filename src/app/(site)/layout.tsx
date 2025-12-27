import type { Metadata } from 'next';
import Script from 'next/script';
import { PropsWithChildren } from 'react';
import { Footer, Navbar } from '@/components/layout';
import { formatAddress } from '@/lib/address';
import { getSiteSettings } from '@/lib/content';
import { generateOrganizationSchema } from '@/lib/structuredData';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getSiteSettings();

	const ogImageUrl = siteSettings?.seoDefaults?.ogImage
		? urlFor(siteSettings.seoDefaults.ogImage).width(1200).height(630).url()
		: undefined;

	const title = siteSettings?.seoDefaults?.siteTitle;
	const description = siteSettings?.seoDefaults?.siteDescription;

	return {
		title,
		description,
		keywords: siteSettings?.seoDefaults?.keywords,
		openGraph: {
			title,
			description,
			images: ogImageUrl ? [{ url: ogImageUrl }] : [],
			siteName: siteSettings?.clubName,
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

export default async function SiteLayout({ children }: PropsWithChildren) {
	const siteSettings = await getSiteSettings();

	const logoUrl = siteSettings?.logo
		? urlFor(siteSettings.logo).width(80).height(80).url()
		: undefined;
	const logoAlt = siteSettings?.logo?.alt;

	const homeGround = siteSettings?.locations?.find(
		(location: { facilityType?: string }) => location.facilityType === 'home'
	);

	const homeGroundAddress = formatAddress(homeGround);
	const homeGroundLink = homeGround?.mapLink
		? homeGround.mapLink
		: homeGroundAddress
			? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homeGroundAddress)}`
			: undefined;

	const organizationSchema = generateOrganizationSchema(siteSettings);

	return (
		<>
			{organizationSchema && (
				<Script
					id="organization-schema"
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
				/>
			)}
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
