import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Icon } from '@/components/Icon';
import {
	ExpressionOfInterestSection,
	FootballSection,
	HeroCarousel,
	SponsorsSection
} from '@/components/home';
import { NewsListItem } from '@/components/news';
import { formatAddress } from '@/lib/address';
import {
	TransformedNewsArticle,
	getFeaturedArticles,
	getLatestArticles,
	getSiteSettings
} from '@/lib/content';
import { getPageMetadata } from '@/lib/content/page';
import { urlFor } from '@/sanity/lib/image';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('homePage');
}

export default async function Home() {
	const [featuredArticles, latestArticles, olderArticles, siteSettings] = await Promise.all([
		getFeaturedArticles(),
		getLatestArticles(3),
		getLatestArticles(8),
		getSiteSettings()
	]);

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
		<div className="bg-base-200 min-h-screen pb-36 lg:pb-12">
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

				{socialLinks.length > 0 && (
					<div className="flex items-center gap-0">
						{socialLinks.map((social) => (
							<a
								key={social.name}
								href={social.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-base-content hover:bg-base-300 rounded-full p-1.5 transition-colors hover:ring-2 sm:p-2"
								aria-label={social.name}
							>
								{social.icon === 'mapPin' ? (
									<MapPin className="h-5 w-5 sm:h-5 sm:w-5" />
								) : (
									<Icon
										name={social.icon as 'facebook' | 'instagram' | 'youtube'}
										className="h-5 w-5 sm:h-5 sm:w-5"
									/>
								)}
							</a>
						))}
					</div>
				)}
			</div>

			{featuredArticles.length > 0 && (
				<div className="container mx-auto px-4 pt-6 lg:pt-(--navbar-total-height-desktop)">
					<div className="flex flex-col gap-6 lg:flex-row">
						{/* Hero Carousel - Left Side */}
						<div className="lg:w-2/3">
							<HeroCarousel articles={featuredArticles} />
						</div>

						{/* Older News List - Right Side */}
						{olderArticles.length > 0 && (
							<div className="lg:w-1/3">
								<div className="card bg-base-100 h-full shadow-lg">
									<div className="card-body p-0">
										<h2 className="card-title border-base-300 border-b px-6 py-4 text-lg">
											Latest News
										</h2>
										<div className="max-h-[60vh] overflow-y-auto px-6 lg:max-h-[75vh]">
											{olderArticles.map((article: TransformedNewsArticle) => (
												<NewsListItem
													key={article._id}
													slug={article.slug}
													title={article.title}
													publishedAt={article.publishedAt}
												/>
											))}
										</div>
										<div className="border-base-300 border-t p-4">
											<Link href="/news" className="btn btn-primary btn-outline btn-block btn-sm">
												View all news
											</Link>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{featuredArticles.length === 0 && (
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

			{/* Latest News Section */}
			{latestArticles.length > 0 && (
				<section className="container mx-auto mb-8 px-4 py-12">
					<div className="card bg-base-100 shadow-lg">
						<div className="card-body p-0">
							<h2 className="card-title border-base-300 border-b px-6 py-4 text-xl">Recent News</h2>
							<div className="px-6">
								{latestArticles.map((article: TransformedNewsArticle) => (
									<NewsListItem
										key={article._id}
										slug={article.slug}
										title={article.title}
										publishedAt={article.publishedAt}
									/>
								))}
							</div>
							<div className="border-base-300 border-t p-4">
								<Link href="/news" className="btn btn-primary btn-outline btn-block">
									View all news
								</Link>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Football Section */}
			<FootballSection />

			{/* Expression of Interest Section */}
			<ExpressionOfInterestSection />

			{/* Sponsors Section */}
			<SponsorsSection />
		</div>
	);
}
