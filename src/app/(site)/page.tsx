import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
	ExpressionOfInterestSection,
	FootballSection,
	HeroCarousel,
	SocialLinks
} from '@/components/home';
import { KeyDatesSection } from '@/components/home/KeyDatesSection';
import { NewsListItem } from '@/components/news';
import { formatAddress } from '@/lib/address';
import {
	TransformedNewsArticle,
	getFeaturedSponsors,
	getHomePageData,
	getLatestArticles,
	getSiteSettings
} from '@/lib/content';
import { getPageMetadata } from '@/lib/content/page';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('homePage');
}

export default async function Home() {
	const [allNews, siteSettings, homePageData, featuredSponsors] = await Promise.all([
		getLatestArticles(7),
		getSiteSettings(),
		getHomePageData(),
		getFeaturedSponsors(3)
	]);

	const [featuredArticle, ...news] = allNews;
	const logoUrl = siteSettings?.logo ? urlFor(siteSettings.logo).width(120).height(120).url() : '';
	const homeGround = siteSettings?.locations?.find((location) => location.facilityType === 'home');
	const homeGroundAddress = formatAddress(homeGround);

	const homeGroundLink = homeGround?.mapLink
		? homeGround.mapLink
		: homeGroundAddress
			? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homeGroundAddress)}`
			: null;

	const socialLinks = [
		...(homeGroundLink ? [{ name: 'Home Ground', href: homeGroundLink, icon: 'mapPin' }] : []),
		...(siteSettings?.socials?.facebook
			? [{ name: 'Facebook', href: siteSettings.socials.facebook, icon: 'facebook' }]
			: []),
		...(siteSettings?.socials?.instagram
			? [{ name: 'Instagram', href: siteSettings.socials.instagram, icon: 'instagram' }]
			: []),
		...(siteSettings?.socials?.youtube
			? [{ name: 'YouTube', href: siteSettings.socials.youtube, icon: 'youtube' }]
			: [])
	];

	return (
		<div className="bg-base-100 gap- grid min-h-screen gap-6">
			{/* Mobile Header - Only on home page */}
			<div className="flex items-center justify-between px-4 pt-4 lg:hidden">
				<div className="flex items-center gap-2">
					{logoUrl && (
						<Image
							src={logoUrl}
							alt={siteSettings?.logo?.alt || 'Club logo'}
							width={40}
							height={40}
							className="h-10 w-auto shrink-0"
						/>
					)}
					<h1 className="text-lg font-bold sm:text-xl">{siteSettings?.clubName}</h1>
				</div>
				<SocialLinks links={socialLinks} />
			</div>

			{featuredArticle && (
				<div className="lg:mt- container mx-auto lg:mb-4 lg:pt-(--navbar-total-height-desktop)">
					<div className="flex flex-col gap-6 lg:flex-row">
						{/* Hero Carousel - Left Side */}
						<div className="lg:w-2/3">
							<HeroCarousel articles={[featuredArticle]} />
						</div>

						{/* News & Key Dates - Right Side */}
						{news.length > 0 && (
							<div className="lg:w-1/3">
								<div className="card h-full">
									<div className="card-body p-0">
										{/* News Section */}
										{news.length > 0 && (
											<>
												<h2 className="card-title px-6 text-2xl">News</h2>
												<div className="px-6">
													{news.map((article: TransformedNewsArticle) => (
														<NewsListItem
															key={article._id}
															slug={article.slug}
															title={article.title}
															publishedAt={article.publishedAt}
														/>
													))}
												</div>
												<div className="flex justify-center px-6 pt-2 pb-4 md:justify-end">
													<Link href="/news" className="btn btn-primary btn-outline">
														View all news
													</Link>
												</div>
											</>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			<div className="container mx-auto">
				<div className="grid items-stretch gap-4 lg:grid-cols-2">
					{/* Featured Sponsors */}
					<div className="flex h-full flex-col justify-between gap-4 border border-gray-200 bg-white p-6 md:flex-row md:items-start md:rounded-2xl md:p-8">
						<div>
							<h2 className="mb-2 text-2xl font-bold md:text-3xl">Our Sponsors</h2>
							<p className="text-base-content/70 text-base md:text-lg">
								Thank you to our partners for supporting the club.
							</p>
							<div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:justify-start md:gap-6">
								{featuredSponsors.map((sponsor) => (
									<div
										key={sponsor._id}
										className="flex h-14 w-20 items-center justify-center md:h-16 md:w-24"
									>
										<Image
											src={sponsor.logo.url}
											alt={sponsor.logo.alt || `${sponsor.name} logo`}
											width={120}
											height={100}
											className="h-auto max-h-12 w-auto object-contain md:max-h-14"
										/>
									</div>
								))}
							</div>
						</div>
						<div className="flex justify-center md:justify-end">
							<Link href="/sponsors" className="btn btn-primary btn-outline">
								View all sponsors
							</Link>
						</div>
					</div>
					{/* Key Dates Section */}

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
	);
}
