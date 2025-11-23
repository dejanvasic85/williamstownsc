import { ExpressionOfInterestSection } from '@/components/ExpressionOfInterestSection';
import { FootballSection } from '@/components/FootballSection';
import { HeroCarousel } from '@/components/HeroCarousel';
import { Icon } from '@/components/Icon';
import { NewsCard } from '@/components/NewsCard';
import { SponsorsSection } from '@/components/SponsorsSection';
import {
	getFeaturedArticles,
	getLatestArticles,
	getSiteSettings,
	TransformedNewsArticle
} from '@/lib/content';
import { urlFor } from '@/sanity/lib/image';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
	const [featuredArticles, latestArticles, siteSettings] = await Promise.all([
		getFeaturedArticles(),
		getLatestArticles(3),
		getSiteSettings()
	]);

	const logoUrl = siteSettings?.logo ? urlFor(siteSettings.logo).width(120).height(120).url() : '';

	const homeGround = siteSettings?.locations?.find(
		(location: { facilityType?: string }) => location.facilityType === 'home'
	);
	const homeGroundLink = homeGround?.mapLink
		? homeGround.mapLink
		: homeGround?.address
			? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homeGround.address)}`
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
				<div className="container mx-auto mb-12 px-4 pt-6 lg:pt-(--navbar-total-height-desktop)">
					<HeroCarousel articles={featuredArticles} />
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
				<section className="container mx-auto px-4 py-12">
					<div className="mb-8 flex items-center justify-between">
						<h2 className="text-3xl font-bold">Other news and match reports</h2>
						<Link href="/news" className="btn btn-ghost btn-sm uppercase">
							View all
						</Link>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{latestArticles.map((article: TransformedNewsArticle) => (
							<NewsCard
								key={article._id}
								slug={article.slug}
								title={article.title}
								excerpt={article.excerpt}
								publishedAt={article.publishedAt}
								featuredImage={article.featuredImage}
							/>
						))}
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
