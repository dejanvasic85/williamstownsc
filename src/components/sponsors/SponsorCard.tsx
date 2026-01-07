import Image from 'next/image';
import clsx from 'clsx';

type SponsorCardProps = {
	logoUrl: string;
	logoAlt?: string;
	name: string;
	size?: 'medium' | 'large';
};

export function SponsorCard({ logoUrl, logoAlt, name, size = 'large' }: SponsorCardProps) {
	return (
		<div
			className={clsx(
				'border-base-300 bg-surface flex items-center justify-center overflow-hidden rounded-2xl border p-6 shadow-md transition-all hover:shadow-xl',
				size === 'medium' ? 'size-40' : 'size-60'
			)}
		>
			<Image
				src={logoUrl}
				alt={logoAlt || `${name} logo`}
				width={250}
				height={200}
				className="h-auto w-full object-contain"
			/>
		</div>
	);
}
