import Image from 'next/image';

type SponsorCardProps = {
	logoUrl: string;
	logoAlt?: string;
	name: string;
};

export function SponsorCard({ logoUrl, logoAlt, name }: SponsorCardProps) {
	return (
		<div className="flex h-60 w-60 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-xl">
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
