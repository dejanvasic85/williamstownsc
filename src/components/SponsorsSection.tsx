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
		<section className="relative overflow-hidden py-16">
			{/* Decorative gradient blobs */}
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
						<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:gap-8">
							{sponsorsValue.map((sponsor) => (
								<div
									key={sponsor.name}
									className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-white/50 bg-white/30 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] backdrop-blur-md transition-all hover:shadow-xl md:p-10"
								>
									<Image
										src={sponsor.logoUrl}
										alt={`${sponsor.name} logo`}
										width={250}
										height={83}
										className="h-auto w-full max-w-[200px] object-contain md:max-w-[250px]"
									/>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Call to Action */}
				<div className="relative overflow-hidden rounded-2xl p-10 text-center md:p-12">
					<div className="relative">
						<h3 className="mb-4 text-3xl font-bold">Become a sponsor</h3>
						<p className="text-base-content/70 mx-auto mb-8 max-w-2xl text-lg">
							Support our club and gain visibility in the local community. We offer various
							sponsorship packages to suit your needs.
						</p>
						<Link href="/sponsors" className="btn btn-outline btn-lg btn-primary">
							Become a sponsor
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
