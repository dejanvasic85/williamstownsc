import clsx from 'clsx';
import type { SponsorTier } from '@/lib/content';
import { SponsorCard } from './SponsorCard';

type CardVariant = 'featured' | 'standard' | 'compact';

type SponsorTierGroupProps = {
	tier: SponsorTier;
};

const cardSizeToVariant: Record<string, CardVariant> = {
	large: 'featured',
	medium: 'standard',
	small: 'compact'
};

const gridByVariant: Record<CardVariant, string> = {
	featured: 'grid-cols-1 lg:grid-cols-2',
	standard: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
	compact: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
};

export function SponsorTierGroup({ tier }: SponsorTierGroupProps) {
	const variant = cardSizeToVariant[tier.cardSize] ?? 'standard';

	return (
		<section
			className={clsx(
				'border-secondary/30 relative rounded-xl border-2 p-6 pt-8 md:p-8 md:pt-10',
				'shadow-[0_0_15px_color-mix(in_srgb,var(--color-secondary)_15%,transparent)]'
			)}
		>
			<div className="absolute -top-3 right-4">
				<span className="badge badge-secondary font-semibold">{tier.name}</span>
			</div>
			<div className={clsx('grid gap-6', gridByVariant[variant])}>
				{tier.sponsors.map((sponsor) => (
					<SponsorCard
						key={sponsor._id}
						logoUrl={sponsor.logo.url}
						logoAlt={sponsor.logo.alt}
						name={sponsor.name}
						description={sponsor.description}
						website={sponsor.website}
						variant={variant}
					/>
				))}
			</div>
		</section>
	);
}
