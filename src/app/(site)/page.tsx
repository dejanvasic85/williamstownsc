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
import type { MatchColor } from '@/components/home/MatchCountdownSection';
import {
	getAnnouncements,
	getFeaturedSponsors,
	getHomePageData,
	getNewsArticles,
	getSiteSettings
} from '@/lib/content';
import { getHomepageNextMatchTeams } from '@/lib/content/homepageNextMatchTeams';
import { getNextKeyDate } from '@/lib/content/keyDates';
import { getPageMetadata } from '@/lib/content/page';
import { getNextMatch } from '@/lib/matches/matchService';
import { buildSocialLinks } from '@/lib/socialLinks';
import { urlFor } from '@/sanity/lib/image';

const nextMatchCardColors: MatchColor[] = ['blue', 'purple'];

// The match countdown reads live matchday fixtures, so this tracks the team routes' 3600 rather
// than the 86400 the rest of the homepage's Sanity content would be happy with.
export const revalidate = 3600;

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
		nextMatchTeams,
		nextKeyDate
	] = await Promise.all([
		getNewsArticles({ limit: 10, featured: true, imageSize: 'large' }),
		getSiteSettings(),
		getHomePageData(),
		getFeaturedSponsors(),
		getAnnouncements(),
		getHomepageNextMatchTeams(),
		getNextKeyDate()
	]);

	const nextMatchCards = await Promise.all(
		nextMatchTeams.map(async (team, index) => ({
			...team,
			match: await getNextMatch(team.slug),
			color: nextMatchCardColors[index]
		}))
	);

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
						{nextMatchCards.map((card) => (
							<MatchCountdownSection
								key={card.slug}
								match={card.match}
								teamSlug={card.slug}
								teamName={card.displayName}
								color={card.color}
							/>
						))}
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
