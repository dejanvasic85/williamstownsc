import type { Metadata } from 'next';
import clsx from 'clsx';
import {
	ExpressionOfInterestSection,
	FootballSection,
	HeroCarousel,
	MobileHeader,
	NewsPanel,
	SponsorsSection
} from '@/components/home';
import { KeyDatesSection } from '@/components/home/KeyDatesSection';
import { getActiveAnnouncements } from '@/lib/announcements';
import {
	getFeaturedSponsors,
	getHomePageData,
	getNewsArticles,
	getSiteSettings
} from '@/lib/content';
import { getPageMetadata } from '@/lib/content/page';
import { buildSocialLinks } from '@/lib/socialLinks';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('homePage');
}

export default async function Home() {
	const [
		carouselArticles,
		generalNews,
		siteSettings,
		homePageData,
		featuredSponsors,
		{ hasAnnouncements }
	] = await Promise.all([
		getNewsArticles({ limit: 10, featured: true, imageSize: 'large' }),
		getNewsArticles({ limit: 5, featured: 'exclude', imageSize: 'small' }),
		getSiteSettings(),
		getHomePageData(),
		getFeaturedSponsors(3),
		getActiveAnnouncements()
	]);
	const logoUrl = siteSettings?.logo ? urlFor(siteSettings.logo).width(120).height(120).url() : '';

	const socialLinks = buildSocialLinks({
		locations: siteSettings?.locations,
		socials: siteSettings?.socials
	});

	return (
		<div className="bg-base-100 min-h-screen">
			<h1 className="sr-only">{siteSettings.clubName} Homepage</h1>
			<MobileHeader
				logoUrl={logoUrl}
				logoAlt={siteSettings?.logo?.alt}
				clubName={siteSettings?.clubName}
				socialLinks={socialLinks}
			/>

			<div className="grid gap-12">
				<div
					className={clsx(
						'container mx-auto lg:mb-4',
						hasAnnouncements
							? 'lg:pt-(--navbar-with-banner-height)'
							: 'lg:pt-(--navbar-with-offset)'
					)}
				>
					<div className="flex flex-col gap-6 lg:flex-row">
						{/* Hero Carousel - Left Side */}
						<div className="lg:w-2/3">
							<HeroCarousel articles={carouselArticles} />
						</div>

						{/* News Panel - Right Side */}
						<NewsPanel articles={generalNews} />
					</div>
				</div>

				<div className="container mx-auto">
					<div className="grid items-stretch gap-12 lg:grid-cols-2">
						<SponsorsSection sponsors={featuredSponsors} />
						<KeyDatesSection
							heading={homePageData?.keyDatesSection?.heading}
							leadingText={homePageData?.keyDatesSection?.leadingText}
						/>
					</div>
				</div>

				{/* Football Section */}
				<FootballSection />

				{/* Expression of Interest Section */}
				<ExpressionOfInterestSection />
			</div>
		</div>
	);
}
