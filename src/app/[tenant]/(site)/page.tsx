import type { Metadata } from 'next';
import clsx from 'clsx';
import {
	ContactSection,
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
import { getCurrentTenant } from '@/tenants/current';

const nextMatchCardColors: MatchColor[] = ['blue', 'purple'];
// Column spans on a 6-column grid, keyed by how many match cards show.
// Contact always sits left of key dates; with two matches they move to a second row.
const cardColumnLayoutValue = [
	{ match: '', contact: 'md:col-span-2', keyDates: 'md:col-span-4' },
	{ match: 'md:col-span-2', contact: 'md:col-span-2', keyDates: 'md:col-span-2' },
	{ match: 'md:col-span-3', contact: 'md:col-span-2', keyDates: 'md:col-span-4' }
];

// The match countdown reads live matchday fixtures, so it tracks the team routes' 3600.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
	const tenant = await getCurrentTenant();
	return getPageMetadata(tenant, 'homePage');
}

export default async function Home() {
	const tenant = await getCurrentTenant();
	const [
		carouselArticles,
		siteSettings,
		homePageData,
		featuredSponsors,
		announcements,
		nextMatchTeams,
		nextKeyDate
	] = await Promise.all([
		getNewsArticles(tenant, { limit: 10, featured: true, imageSize: 'large' }),
		getSiteSettings(tenant),
		getHomePageData(tenant),
		getFeaturedSponsors(tenant),
		getAnnouncements(tenant),
		getHomepageNextMatchTeams(tenant),
		getNextKeyDate(tenant)
	]);

	const nextMatchCards = await Promise.all(
		nextMatchTeams.map(async (team, index) => ({
			...team,
			match: await getNextMatch(tenant, team.slug),
			color: nextMatchCardColors[index]
		}))
	);
	const upcomingMatchCards = nextMatchCards.filter(
		(card): card is typeof card & { match: NonNullable<typeof card.match> } => card.match !== null
	);
	const cardColumnLayout =
		cardColumnLayoutValue[upcomingMatchCards.length] ?? cardColumnLayoutValue[0];

	const hasAnnouncements = announcements.length > 0;
	const logoUrl = siteSettings?.logo
		? urlFor(tenant.sanity, siteSettings.logo).width(120).height(120).fit('crop').url()
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
					<div className="grid items-stretch gap-8 md:grid-cols-6">
						{upcomingMatchCards.map((card) => (
							<div key={card.slug} className={cardColumnLayout.match}>
								<MatchCountdownSection
									match={card.match}
									teamSlug={card.slug}
									teamName={card.displayName}
									color={card.color}
								/>
							</div>
						))}
						<div className={cardColumnLayout.contact}>
							<ContactSection />
						</div>
						<div className={cardColumnLayout.keyDates}>
							<KeyDatesSection
								heading={homePageData?.keyDatesSection?.heading}
								leadingText={homePageData?.keyDatesSection?.leadingText}
								nextKeyDate={nextKeyDate}
							/>
						</div>
					</div>
					<div className="mt-12">
						<SponsorsSection sponsors={featuredSponsors} />
					</div>
				</div>

				{/* Football Section */}
				<FootballSection tenant={tenant} />

				{/* Expression of Interest Section */}
				<ExpressionOfInterestSection />
			</div>
		</div>
	);
}
