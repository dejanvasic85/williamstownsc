import type { Metadata } from 'next';
import NextLink from 'next/link';
import { PageContainer } from '@/components/layout';
import { SponsorTierGroup } from '@/components/sponsors';
import { getSponsorsGroupedByTier } from '@/lib/content';
import { getPageMetadata } from '@/lib/content/page';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('sponsorsPage');
}

export default async function SponsorsPage() {
	const tiers = await getSponsorsGroupedByTier();

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

				<div className="relative text-center">
					<h2 className="mb-4 text-3xl font-bold">Become a Sponsor</h2>
					<p className="text-base-content/70 mx-auto mb-8 max-w-3xl text-lg">
						Williamstown SC offers a range of sponsorship opportunities to help your business
						connect with our community. Our sponsorship packages provide excellent visibility and
						demonstrate your commitment to local sport.
					</p>
					<p className="mb-4 text-lg font-semibold">Interested in sponsoring our club?</p>
					<NextLink href="/contact?type=sponsor" className="btn btn-primary btn-lg shadow-lg">
						Become a sponsor
					</NextLink>
				</div>
			</section>
		</PageContainer>
	);
}
