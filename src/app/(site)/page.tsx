import { getFeaturedArticles } from '@/lib/content';
import { HeroCarousel } from '@/components/HeroCarousel';

export default async function Home() {
	const featuredArticles = await getFeaturedArticles();
	console.log('featured', featuredArticles);

	return (
		<div className="min-h-screen bg-base-200">
			{featuredArticles.length > 0 && (
				<div className="container mx-auto mb-12 px-4 pt-6 lg:pt-[var(--navbar-total-height-desktop)]">
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
