import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
	ExpressionOfInterestSection,
	FootballSection,
	HeroCarousel,
	SocialLinks,
	SponsorsSection
} from '@/components/home';
import { NewsListItem } from '@/components/news';
import { formatAddress } from '@/lib/address';
import {
	TransformedNewsArticle,
	getHomePageData,
	getKeyDatesPageData,
	getLatestArticles,
	getSiteSettings
} from '@/lib/content';
import { getPageMetadata } from '@/lib/content/page';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('homePage');
}

function formatKeyDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function Home() {
	const [news, siteSettings, homePageData, keyDatesData] = await Promise.all([
		getLatestArticles(7),
		getSiteSettings(),
		getHomePageData(),
		getKeyDatesPageData()
	]);

	const [featuredArticle, ...latestNews] = news;
	const allKeyDates = keyDatesData?.keyDates || [];

	// Determine what to show: max 4 items if both types exist, max 6 if only one type
	const hasKeyDates = allKeyDates.length > 0;
	const hasNews = latestNews.length > 0;

	let newsToShow: TransformedNewsArticle[] = [];
	let keyDatesToShow: typeof allKeyDates = [];

	if (hasNews && hasKeyDates) {
		// Show max 4 total, try to show 2 of each if possible
		const availableNews = latestNews.length;
		const availableKeyDates = allKeyDates.length;

		if (availableNews >= 2 && availableKeyDates >= 2) {
			newsToShow = latestNews.slice(0, 2);
			keyDatesToShow = allKeyDates.slice(0, 2);
		} else if (availableNews < 2) {
			newsToShow = latestNews;
			const remaining = 4 - availableNews;
			keyDatesToShow = allKeyDates.slice(0, Math.min(remaining, availableKeyDates));
		} else {
			keyDatesToShow = allKeyDates;
			const remaining = 4 - availableKeyDates;
			newsToShow = latestNews.slice(0, Math.min(remaining, availableNews));
		}
	} else if (hasNews) {
		// Only news, show up to 6
		newsToShow = latestNews.slice(0, 6);
	} else if (hasKeyDates) {
		// Only key dates, show up to 6
		keyDatesToShow = allKeyDates.slice(0, 6);
	}

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
		<div className="bg-base-100 min-h-screen pb-36 lg:pb-12">
			{/* Mobile Header - Only on home page */}
			<div className="flex items-center justify-between px-4 pt-6 lg:hidden">
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
				<div className="container mx-auto my-4 lg:mt-0 lg:mb-10 lg:pt-(--navbar-total-height-desktop)">
					<div className="flex flex-col gap-6 lg:flex-row">
						{/* Hero Carousel - Left Side */}
						<div className="lg:w-2/3">
							<HeroCarousel articles={[featuredArticle]} />
						</div>

						{/* News & Key Dates - Right Side */}
						{(newsToShow.length > 0 || keyDatesToShow.length > 0) && (
							<div className="lg:w-1/3">
								<div className="card h-full">
									<div className="card-body p-0">
										{/* News Section */}
										{newsToShow.length > 0 && (
											<>
												<h2 className="card-title px-6 text-2xl">News</h2>
												<div className="px-6">
													{newsToShow.map((article: TransformedNewsArticle) => (
														<NewsListItem
															key={article._id}
															slug={article.slug}
															title={article.title}
															publishedAt={article.publishedAt}
														/>
													))}
												</div>
												<div className="flex justify-center p-4 md:justify-end">
													<Link href="/news" className="btn btn-primary btn-outline">
														View all news
													</Link>
												</div>
											</>
										)}

										{/* Key Dates Section */}
										{keyDatesToShow.length > 0 && (
											<>
												{newsToShow.length > 0 && <div className="divider mx-6 my-0"></div>}
												<h2 className="card-title px-6 text-2xl">Key dates</h2>
												<div className="px-6">
													{keyDatesToShow.map((keyDate, index) => (
														<div
															key={index}
															className="border-base-content/10 border-b py-4 last:border-b-0"
														>
															<h3 className="text-base font-semibold">{keyDate.title}</h3>
															<p className="text-base-content/60 mt-1 text-sm">
																{formatKeyDate(keyDate.date)}
															</p>
														</div>
													))}
												</div>
												<div className="flex justify-center p-4 md:justify-end">
													<Link href="/key-dates" className="btn btn-primary btn-outline">
														View all key dates
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

			{!featuredArticle && (
				<div className="hero bg-base-200 min-h-[60vh]">
					<div className="hero-content text-center">
						<div className="max-w-md">
							<h1 className="text-5xl font-bold">Welcome to Williamstown SC</h1>
							<p className="py-6">
								Building community through soccer. Join us for competitive play, skill development,
								and lifelong friendships.
							</p>
							<button className="btn btn-primary">Get Started</button>
						</div>
					</div>
				</div>
			)}

			{/* Sponsors Section */}
			<SponsorsSection />

			{/* Football Section */}
			<FootballSection />

			{/* Expression of Interest Section */}
			<ExpressionOfInterestSection />
		</div>
	);
}
