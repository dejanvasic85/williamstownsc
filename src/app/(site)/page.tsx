import { getFeaturedArticles, getLatestArticles, getSiteSettings } from '@/lib/content';
import { HeroCarousel } from '@/components/HeroCarousel';
import { NewsCard } from '@/components/NewsCard';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, MapPin } from 'lucide-react';

export default async function Home() {
	const [featuredArticles, latestArticles, siteSettings] = await Promise.all([
		getFeaturedArticles(),
		getLatestArticles(3),
		getSiteSettings()
	]);

	const logoUrl = siteSettings?.logo ? urlFor(siteSettings.logo).width(120).height(120).url() : '';

	const homeGround = siteSettings?.locations?.find((location) => location.facilityType === 'home');
	const homeGroundLink = homeGround?.mapLink
		? homeGround.mapLink
		: homeGround?.address
			? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homeGround.address)}`
			: null;

	const socialLinks = [
		...(homeGroundLink ? [{ name: 'Home Ground', href: homeGroundLink, icon: MapPin }] : []),
		...(siteSettings?.socials?.facebook
			? [{ name: 'Facebook', href: siteSettings.socials.facebook, icon: Facebook }]
			: []),
		...(siteSettings?.socials?.instagram
			? [{ name: 'Instagram', href: siteSettings.socials.instagram, icon: Instagram }]
			: []),
		...(siteSettings?.socials?.youtube
			? [{ name: 'YouTube', href: siteSettings.socials.youtube, icon: Youtube }]
			: [])
	];

	return (
		<div className="min-h-screen bg-base-200">
			{/* Mobile Header */}
			<div className="flex items-center justify-between px-4 pt-6 lg:hidden">
				<div className="flex items-center gap-3">
					{logoUrl && (
						<Image
							src={logoUrl}
							alt={siteSettings?.logo?.alt || 'Club logo'}
							width={48}
							height={48}
							className="h-12 w-auto"
						/>
					)}
					<h1 className="text-2xl font-bold">{siteSettings?.clubName}</h1>
				</div>

				{socialLinks.length > 0 && (
					<div className="flex items-center gap-1">
						{socialLinks.map((social) => {
							const Icon = social.icon;
							return (
								<a
									key={social.name}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded-full p-2 text-base-content transition-colors hover:bg-base-300"
									aria-label={social.name}
								>
									<Icon className="h-5 w-5" />
								</a>
							);
						})}
					</div>
				)}
			</div>

			{featuredArticles.length > 0 && (
				<div className="container mx-auto mb-12 px-4 pt-6 lg:pt-(--navbar-total-height-desktop)">
					<HeroCarousel articles={featuredArticles} />
				</div>
			)}

			{featuredArticles.length === 0 && (
				<div className="hero min-h-[60vh] bg-base-200">
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
						{latestArticles.map((article) => (
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

			<div className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title">Youth Programs</h2>
							<p>Develop skills and passion for the game in our youth programs.</p>
							<div className="card-actions justify-end">
								<button className="btn btn-primary">Learn More</button>
							</div>
						</div>
					</div>

					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title">Senior Teams</h2>
							<p>Competitive play for adults at all skill levels.</p>
							<div className="card-actions justify-end">
								<button className="btn btn-primary">Learn More</button>
							</div>
						</div>
					</div>

					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<h2 className="card-title">Training</h2>
							<p>Professional coaching to help you reach your potential.</p>
							<div className="card-actions justify-end">
								<button className="btn btn-primary">Learn More</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<footer className="footer footer-center bg-base-300 p-10 text-base-content">
				<aside>
					<p className="font-bold">Williamstown SC</p>
					<p>Building community through soccer since 2025</p>
				</aside>
			</footer>
		</div>
	);
}
