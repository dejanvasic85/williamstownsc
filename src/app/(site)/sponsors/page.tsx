import type { Metadata } from 'next';
import NextLink from 'next/link';
import { PageContainer } from '@/components/layout';
import { SponsorTierGroup } from '@/components/sponsors';
import { getAllSponsorTypes, getSponsorsGroupedByTier } from '@/lib/content';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('sponsorsPage');
}

export default async function SponsorsPage() {
	const [tiers, sponsorTypes] = await Promise.all([
		getSponsorsGroupedByTier(),
		getAllSponsorTypes()
	]);

	return (
		<PageContainer
			heading="Our Sponsors"
			intro="We are grateful for the support of our sponsors who help make our club possible."
		>
			{/* Sponsor Tiers */}
			<div className="mb-16 flex flex-col gap-10">
				{tiers.map((tier) => (
					<SponsorTierGroup key={tier.name} tier={tier} />
				))}
			</div>

			{/* Become a Sponsor */}
			<section className="from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden rounded-2xl bg-linear-to-br p-8 shadow-xl md:p-12">
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
						{sponsorTypes.map((sponsorType) => (
							<div
								key={sponsorType.name}
								className="bg-base-100/80 group relative overflow-hidden rounded-xl p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
							>
								<div className="from-secondary/10 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								<div className="relative">
									<h3 className="mb-3 text-xl font-bold">{sponsorType.name}</h3>
									{sponsorType.description && (
										<p className="text-base-content/70">{sponsorType.description}</p>
									)}
								</div>
							</div>
						))}
					</div>

					<div className="text-center">
						<p className="mb-4 text-lg font-semibold">Interested in sponsoring our club?</p>
						<NextLink href="/contact?type=sponsor" className="btn btn-primary btn-lg shadow-lg">
							Become a sponsor
						</NextLink>
					</div>
				</div>
			</section>
		</PageContainer>
	);
}
