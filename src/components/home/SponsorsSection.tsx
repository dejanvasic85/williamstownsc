import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedSponsors } from '@/lib/content';

export async function SponsorsSection() {
	const sponsors = await getFeaturedSponsors(3);
	return (
		<section className="relative overflow-hidden">
			{/* Decorative gradient blobs */}
			<div className="relative container mx-auto px-4">
				{/*<div className="mb-12 text-center">
					<h2 className="mb-4 text-4xl font-bold">Our Sponsors</h2>
					<p className="text-base-content/70 mx-auto max-w-2xl text-lg">
						Thank you to our valued sponsors who make our programs possible
					</p>
				</div>*/}

				{/* Sponsors */}
				{sponsors.length > 0 && (
					<div className="flex w-full flex-wrap justify-center gap-12">
						{sponsors.map((sponsor) => (
							<div
								key={sponsor._id}
								className="relative flex h-60 w-60 items-center justify-center overflow-hidden rounded-2xl border border-white/50 bg-white/30 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] backdrop-blur-md transition-all hover:shadow-xl"
							>
								<Image
									src={sponsor.logo.url}
									alt={sponsor.logo.alt || `${sponsor.name} logo`}
									width={250}
									height={200}
									className="h-auto w-full object-contain"
								/>
							</div>
						))}
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
						<Link href="/contact?type=sponsorship" className="btn btn-outline btn-lg btn-primary">
							Become a sponsor
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
