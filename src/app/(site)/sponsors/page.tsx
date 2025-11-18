import { PageContainer } from '@/components/layout';
import Image from 'next/image';

interface Sponsor {
	name: string;
	logoUrl: string;
	website?: string;
	description?: string;
}

const principalSponsorsValue: Sponsor[] = [
	{
		name: 'Trek',
		logoUrl: '/img/trek_bicycle_corporation.png',
		website: 'https://www.trekbikes.com',
		description:
			'Trek Bicycle Corporation is a leading manufacturer of bicycles and cycling products.'
	}
];

const majorSponsorsValue: Sponsor[] = [
	{
		name: 'McDonalds',
		logoUrl: '/img/mcdonalds-logo-1.webp',
		website: 'https://www.mcdonalds.com.au',
		description: 'Serving communities across Australia with quality food and local support.'
	},
	{
		name: 'Specsavers',
		logoUrl: '/img/specsavers logo.jpeg',
		website: 'https://www.specsavers.com.au',
		description: 'Leading optometry services focused on eye health and affordable eyewear.'
	}
];

export default function SponsorsPage() {
	return (
		<PageContainer>
			<div className="mb-12">
				<h1 className="border-secondary mb-4 border-b-4 pb-4 text-2xl font-bold lg:text-3xl">
					Our Sponsors
				</h1>
				<p className="text-base-content/70 text-lg">
					We are grateful for the support of our sponsors who help make our club possible.
				</p>
			</div>

			{/* Principal Sponsors */}
			{principalSponsorsValue.length > 0 && (
				<section className="mb-16">
					<h2 className="mb-8 text-3xl font-bold">Principal Sponsor</h2>
					<div className="grid grid-cols-1 gap-8">
						{principalSponsorsValue.map((sponsor) => (
							<div
								key={sponsor.name}
								className="bg-base-100 group relative overflow-hidden rounded-2xl shadow-xl transition-all hover:shadow-2xl"
							>
								<div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								<div className="relative flex flex-col items-center p-8 md:flex-row md:gap-8 md:p-10">
									<div className="mb-6 flex w-full items-center justify-center md:mb-0 md:w-1/3">
										<Image
											src={sponsor.logoUrl}
											alt={`${sponsor.name} logo`}
											width={350}
											height={117}
											className="h-auto w-full max-w-xs object-contain"
										/>
									</div>
									<div className="w-full text-center md:w-2/3 md:text-left">
										<h3 className="mb-3 text-2xl font-bold">{sponsor.name}</h3>
										{sponsor.description && (
											<p className="text-base-content/70 mb-6 text-lg">{sponsor.description}</p>
										)}
										{sponsor.website && (
											<a
												href={sponsor.website}
												target="_blank"
												rel="noopener noreferrer"
												className="btn btn-primary shadow-lg"
											>
												Visit Website
											</a>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Major Sponsors */}
			{majorSponsorsValue.length > 0 && (
				<section className="mb-16">
					<h2 className="mb-8 text-3xl font-bold">Major Sponsors</h2>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						{majorSponsorsValue.map((sponsor) => (
							<div
								key={sponsor.name}
								className="bg-base-100 group relative overflow-hidden rounded-2xl shadow-lg transition-all hover:shadow-xl"
							>
								<div className="from-secondary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								<div className="relative flex flex-col items-center p-8">
									<div className="mb-6 flex w-full items-center justify-center">
										<Image
											src={sponsor.logoUrl}
											alt={`${sponsor.name} logo`}
											width={250}
											height={83}
											className="h-auto w-full max-w-[200px] object-contain"
										/>
									</div>
									<div className="w-full text-center">
										<h3 className="mb-3 text-xl font-bold">{sponsor.name}</h3>
										{sponsor.description && (
											<p className="text-base-content/70 mb-4">{sponsor.description}</p>
										)}
										{sponsor.website && (
											<a
												href={sponsor.website}
												target="_blank"
												rel="noopener noreferrer"
												className="btn btn-primary btn-sm shadow-md"
											>
												Visit Website
											</a>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Become a Sponsor */}
			<section className="from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden rounded-2xl bg-gradient-to-br p-8 shadow-xl md:p-12">
				<div className="bg-primary/20 absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl" />
				<div className="bg-secondary/20 absolute -bottom-16 -left-16 h-64 w-64 rounded-full blur-3xl" />

				<div className="relative">
					<h2 className="mb-4 text-center text-3xl font-bold">Become a Sponsor</h2>
					<p className="text-base-content/70 mx-auto mb-10 max-w-3xl text-center text-lg">
						Williamstown SC offers a range of sponsorship opportunities to help your business
						connect with our community. Our sponsorship packages provide excellent visibility and
						demonstrate your commitment to local sport.
					</p>

					<div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
							<div className="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<h3 className="mb-3 text-xl font-bold">Principal Sponsor</h3>
								<p className="text-base-content/70">
									Maximum exposure across all club activities, signage, and communications.
								</p>
							</div>
						</div>
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
							<div className="from-secondary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<h3 className="mb-3 text-xl font-bold">Major Sponsor</h3>
								<p className="text-base-content/70">
									Prominent branding on team uniforms and major event sponsorship opportunities.
								</p>
							</div>
						</div>
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
							<div className="from-accent/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<h3 className="mb-3 text-xl font-bold">Community Partner</h3>
								<p className="text-base-content/70">
									Support specific programs or age groups while building local connections.
								</p>
							</div>
						</div>
					</div>

					<div className="text-center">
						<p className="mb-4 text-lg font-semibold">Interested in sponsoring our club?</p>
						<a
							href="mailto:sponsorship@williamstownsc.com.au"
							className="btn btn-primary btn-lg shadow-lg"
						>
							Contact Us About Sponsorship
						</a>
					</div>
				</div>
			</section>
		</PageContainer>
	);
}
