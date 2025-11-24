import { PageContainer } from '@/components/layout';
import clsx from 'clsx';
import Image from 'next/image';

interface Sponsor {
	name: string;
	logoUrl: string;
	website?: string;
	description?: string;
	type: string;
	location?: string;
	contact?: string;
}

const sponsorsValue: Sponsor[] = [
	{
		name: 'Trek',
		logoUrl: '/img/trek_bicycle_corporation.png',
		website: 'https://www.trekbikes.com',
		description:
			'Trek Bicycle Corporation is a leading manufacturer of bicycles and cycling products.',
		type: 'Principal',
		location: 'Waterloo, Wisconsin',
		contact: 'contact@trekbikes.com'
	},
	{
		name: 'McDonalds',
		logoUrl: '/img/mcdonalds-logo-1.webp',
		website: 'https://www.mcdonalds.com.au',
		description: 'Serving communities across Australia with quality food and local support.',
		type: 'Major',
		location: 'Williamstown, VIC',
		contact: '(03) 9397 7777'
	},
	{
		name: 'Specsavers',
		logoUrl: '/img/specsavers logo.jpeg',
		website: 'https://www.specsavers.com.au',
		description: 'Leading optometry services focused on eye health and affordable eyewear.',
		type: 'Major',
		location: 'Williamstown, VIC',
		contact: '(03) 9399 9744'
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

			{/* All Sponsors */}
			<div className="mb-16 flex flex-col items-center gap-8">
				{sponsorsValue.map((sponsor, index) => {
					const isEven = index % 2 === 0;
					return (
						<div
							key={sponsor.name}
							className="group relative w-full overflow-hidden rounded-3xl bg-white p-8 transition-all md:w-8/12"
						>
							<div className="relative flex flex-col items-start gap-8 md:flex-row">
								{/* Content - Always order-1 on mobile, alternates on desktop */}
								<div
									className={`order-1 flex w-full flex-col md:w-3/5 ${
										isEven ? 'md:order-2' : 'md:order-1'
									}`}
								>
									<h3 className="mb-2 text-2xl font-bold">{sponsor.name}</h3>
									<div
										className={clsx(
											'badge mb-4 text-sm font-semibold',
											sponsor.type === 'Principal' && 'badge-secondary'
										)}
									>
										{sponsor.type}
									</div>
									{sponsor.description && (
										<p className="text-base-content/70 mb-4 text-base">{sponsor.description}</p>
									)}

									<p className="text-base-content/60 mb-2 text-sm">
										{sponsor.location} {sponsor.contact}
									</p>

									{sponsor.website && (
										<div>
											<a
												href={sponsor.website}
												target="_blank"
												rel="noopener noreferrer"
												className="btn btn-primary btn-outline"
											>
												Visit Website
											</a>
										</div>
									)}
								</div>

								{/* Image - Always order-2 on mobile (bottom), alternates on desktop */}
								<div
									className={`order-2 flex w-full items-start justify-center md:w-2/5 ${
										isEven ? 'md:order-1' : 'md:order-2'
									}`}
								>
									<div className="relative h-[200px] w-full overflow-hidden rounded-2xl bg-white">
										<Image
											src={sponsor.logoUrl}
											alt={`${sponsor.name} logo`}
											fill
											className="object-contain p-6"
										/>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

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
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all">
							<div className="from-primary/10 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<h3 className="mb-3 text-xl font-bold">Principal Sponsor</h3>
								<p className="text-base-content/70">
									Maximum exposure across all club activities, signage, and communications.
								</p>
							</div>
						</div>
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
							<div className="from-secondary/10 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<h3 className="mb-3 text-xl font-bold">Major Sponsor</h3>
								<p className="text-base-content/70">
									Prominent branding on team uniforms and major event sponsorship opportunities.
								</p>
							</div>
						</div>
						<div className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
							<div className="from-accent/10 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
							Become a sponsor
						</a>
					</div>
				</div>
			</section>
		</PageContainer>
	);
}
