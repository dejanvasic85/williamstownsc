import Link from 'next/link';
import { SponsorCard } from '@/components/sponsors';
import { getFeaturedSponsors } from '@/lib/content';

export async function SponsorsSection() {
	const sponsors = await getFeaturedSponsors(3);
	return (
		<section className="overflow-hidden">
			<div className="container mx-auto px-4">
				{/* Sponsors */}
				{sponsors.length > 0 && (
					<div className="flex w-full flex-wrap justify-center gap-12">
						{sponsors.map((sponsor) => (
							<SponsorCard
								key={sponsor._id}
								logoUrl={sponsor.logo.url}
								logoAlt={sponsor.logo.alt}
								name={sponsor.name}
							/>
						))}
					</div>
				)}

				{/* Call to Action */}
				<div className="overflow-hidden rounded-2xl p-10 text-center md:p-12">
					<div>
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
