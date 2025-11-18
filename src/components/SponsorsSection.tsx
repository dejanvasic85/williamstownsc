import Image from 'next/image';
import Link from 'next/link';

interface Sponsor {
	name: string;
	logoUrl: string;
	tier: 'principal' | 'major' | 'partner';
}

const sponsorsValue: Sponsor[] = [
	{
		name: 'Trek',
		logoUrl: '/img/trek_bicycle_corporation.png',
		tier: 'major'
	},
	{
		name: 'McDonalds',
		logoUrl: '/img/mcdonalds-logo-1.webp',
		tier: 'major'
	},
	{
		name: 'Specsavers',
		logoUrl: '/img/specsavers logo.jpeg',
		tier: 'major'
	}
];

export function SponsorsSection() {
	return (
		<section className="from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden bg-gradient-to-br py-16">
			{/* Decorative gradient blobs */}
			<div className="bg-primary/10 absolute -top-20 -right-20 h-72 w-72 rounded-full blur-3xl" />
			<div className="bg-secondary/10 absolute -bottom-20 -left-20 h-72 w-72 rounded-full blur-3xl" />

			<div className="relative container mx-auto px-4">
				<div className="mb-12 text-center">
					<h2 className="mb-4 text-4xl font-bold">Our Sponsors</h2>
					<p className="text-base-content/70 mx-auto max-w-2xl text-lg">
						Thank you to our valued sponsors who make our programs possible
					</p>
				</div>

				{/* Sponsors */}
				{sponsorsValue.length > 0 && (
					<div className="mb-16">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
							{sponsorsValue.map((sponsor) => (
								<div
									key={sponsor.name}
									className="bg-base-100/80 group relative flex items-center justify-center overflow-hidden rounded-2xl p-8 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl md:p-10"
								>
									<div className="from-secondary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
									<div className="relative">
										<Image
											src={sponsor.logoUrl}
											alt={`${sponsor.name} logo`}
											width={250}
											height={83}
											className="h-auto w-full max-w-[200px] object-contain md:max-w-[250px]"
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Call to Action */}
				<div className="bg-base-100/80 relative overflow-hidden rounded-2xl p-10 text-center shadow-xl backdrop-blur-sm md:p-12">
					<div className="from-primary/10 via-secondary/10 to-accent/10 absolute inset-0 bg-gradient-to-br" />
					<div className="relative">
						<h3 className="mb-4 text-3xl font-bold">Become a Sponsor</h3>
						<p className="text-base-content/70 mx-auto mb-8 max-w-2xl text-lg">
							Support our club and gain visibility in the local community. We offer various
							sponsorship packages to suit your needs.
						</p>
						<Link href="/sponsors" className="btn btn-primary btn-lg shadow-lg">
							Learn More About Sponsorship
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
