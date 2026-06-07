import type { Metadata } from 'next';
import clsx from 'clsx';
import {
	ExpressionOfInterestSection,
	FootballSection,
	HeroSection,
	MatchCountdownSection,
	MobileHeader,
	SponsorsSection
} from '@/components/home';
import { KeyDatesSection } from '@/components/home/KeyDatesSection';
import {
	getAnnouncements,
	getFeaturedSponsors,
	getHomePageData,
	getNewsArticles,
	getSiteSettings
} from '@/lib/content';
import { getNextKeyDate } from '@/lib/content/keyDates';
import { getPageMetadata } from '@/lib/content/page';
import { getNextMatch } from '@/lib/matches/matchService';
import { buildSocialLinks } from '@/lib/socialLinks';
import { urlFor } from '@/sanity/lib/image';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('homePage');
}

export default async function Home() {
	const [
		carouselArticles,
		siteSettings,
		homePageData,
		featuredSponsors,
		announcements,
		seniorMensNextMatch,
		seniorWomensNextMatch,
		nextKeyDate
	] = await Promise.all([
		getNewsArticles({ limit: 10, featured: true, imageSize: 'large' }),
		getSiteSettings(),
		getHomePageData(),
		getFeaturedSponsors(),
		getAnnouncements(),
		getNextMatch('state-league-2-men-s-north-west'),
		getNextMatch('state-league-2-women-s'),
		getNextKeyDate()
	]);

	const hasAnnouncements = announcements.length > 0;
	const logoUrl = siteSettings?.logo
		? urlFor(siteSettings.logo).width(120).height(120).fit('crop').url()
		: '';

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
					<HeroSection articles={carouselArticles} />
				</div>

				<div className="container mx-auto">
					<div className="grid items-stretch gap-8 md:grid-cols-3">
						<MatchCountdownSection
							match={seniorMensNextMatch}
							teamSlug="state-league-2-men-s-north-west"
							teamName="Senior Men's"
							color="blue"
						/>
						<MatchCountdownSection
							match={seniorWomensNextMatch}
							teamSlug="state-league-2-women-s"
							teamName="Senior Women's"
							color="purple"
						/>
						<KeyDatesSection
							heading={homePageData?.keyDatesSection?.heading}
							leadingText={homePageData?.keyDatesSection?.leadingText}
							nextKeyDate={nextKeyDate}
						/>
					</div>
					<div className="mt-12">
						<SponsorsSection sponsors={featuredSponsors} />
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
