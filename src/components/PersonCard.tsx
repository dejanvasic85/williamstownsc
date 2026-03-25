import Image from 'next/image';
import clsx from 'clsx';
import { sanityImageLoader } from '@/lib/sanityImageLoader';

type PersonCardVariant = 'standard' | 'highlighted';

type PersonCardProps = {
	photoUrl: string;
	photoAlt: string;
	variant?: PersonCardVariant;
	children: React.ReactNode;
};

const variantStyles: Record<PersonCardVariant, string> = {
	standard: 'bg-surface text-base-content',
	highlighted: 'bg-primary text-primary-content border-base-300 dark:border-primary border'
};

export function PersonCard({
	photoUrl,
	photoAlt,
	variant = 'standard',
	children
}: PersonCardProps) {
	return (
		<div
			className={clsx(
				'relative mx-auto w-full max-w-64 overflow-hidden rounded-xl transition-shadow hover:shadow-xl',
				variantStyles[variant]
			)}
		>
			<div className="relative aspect-square">
				<Image
					loader={sanityImageLoader}
					src={photoUrl}
					alt={photoAlt}
					fill
					className="object-cover object-top"
					sizes="256px"
				/>
			</div>

			{children}
		</div>
	);
}
