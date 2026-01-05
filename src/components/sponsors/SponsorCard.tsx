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
				'flex items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-xl',
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
