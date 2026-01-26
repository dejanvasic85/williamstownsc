import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { Banner, Footer, Navbar } from '@/components/layout';
import { SearchModal, SearchModalProvider } from '@/components/search';
import { formatAddress } from '@/lib/address';
import { getActiveAnnouncements } from '@/lib/announcements';
import { getSiteSettings } from '@/lib/content';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { generateOrganizationSchema } from '@/lib/structuredData';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata(): Promise<Metadata> {
	const siteSettings = await getSiteSettings();

	const ogImageUrl = siteSettings?.seoDefaults?.ogImage
		? urlFor(siteSettings.seoDefaults.ogImage).width(1200).height(630).url()
		: undefined;

	const title = siteSettings?.seoDefaults?.siteTitle;
	const description = siteSettings?.seoDefaults?.siteDescription;
	const siteUrl = siteSettings?.canonicalUrl || 'https://www.williamstownsc.com';

	return {
		title,
		description,
		alternates: {
			types: {
				'application/rss+xml': `${siteUrl}/feed.xml`
			}
		},
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
	const [siteSettings, { activeAnnouncements, hasAnnouncements }] = await Promise.all([
		getSiteSettings(),
		getActiveAnnouncements()
	]);

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
		<QueryProvider>
			<SearchModalProvider>
				{organizationSchema && (
					<script
						id="organization-schema"
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
					/>
				)}
				<a
					href="#main-content"
					className="bg-primary text-primary-content fixed top-0 left-1/2 z-[100] -translate-x-1/2 -translate-y-full rounded-b-lg px-4 py-2 font-medium transition-transform focus:translate-y-0"
				>
					Skip to main content
				</a>
				<Banner
					messages={activeAnnouncements.map(({ _id, message, type }) => ({
						id: _id,
						message,
						type
					}))}
				/>
				<Navbar
					logoUrl={logoUrl}
					logoAlt={logoAlt}
					clubName={siteSettings?.clubName}
					socials={siteSettings?.socials}
					homeGroundLink={homeGroundLink}
					hasAnnouncements={hasAnnouncements}
				/>
				<main
					id="main-content"
					className={clsx('mb-8', hasAnnouncements ? 'mt-(--banner-height)' : 'mt-0')}
				>
					{children}
				</main>
				<Footer clubName={siteSettings?.clubName} socials={siteSettings?.socials} />
				<SearchModal />
			</SearchModalProvider>
		</QueryProvider>
	);
}
