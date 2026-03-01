import Image from 'next/image';
import clsx from 'clsx';
import { ExternalLink } from 'lucide-react';

type SponsorCardVariant = 'featured' | 'standard' | 'compact';

type SponsorCardProps = {
	logoUrl: string;
	logoAlt?: string;
	name: string;
	description?: string;
	website?: string | null;
	variant?: SponsorCardVariant;
};

type SponsorLogoProps = {
	logoUrl: string;
	logoAlt?: string;
	name: string;
	size: 'large' | 'small';
};

function SponsorLogo({ logoUrl, logoAlt, name, size }: SponsorLogoProps) {
	const dimensions =
		size === 'large'
			? { width: 400, height: 300, className: 'h-32 md:h-40' }
			: { width: 250, height: 200, className: 'h-20 md:h-24' };

	return (
		<div className={clsx('flex w-full items-center justify-center', dimensions.className)}>
			<Image
				src={logoUrl}
				alt={logoAlt || `${name} logo`}
				width={dimensions.width}
				height={dimensions.height}
				className="h-full w-auto object-contain"
			/>
		</div>
	);
}

type WebsiteLinkProps = {
	website: string;
};

function WebsiteLink({ website }: WebsiteLinkProps) {
	return (
		<a
			href={website}
			target="_blank"
			rel="noopener noreferrer"
			className="btn btn-primary btn-outline btn-sm gap-1"
		>
			<ExternalLink className="size-3.5" />
			Visit Website
		</a>
	);
}

function FeaturedCard({ logoUrl, logoAlt, name, description, website }: SponsorCardProps) {
	return (
		<div className="bg-surface flex flex-col overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg md:flex-row">
			<div className="flex items-center justify-center p-6 md:w-2/5 md:p-8">
				<SponsorLogo logoUrl={logoUrl} logoAlt={logoAlt} name={name} size="large" />
			</div>
			<div className="flex flex-col justify-center gap-3 p-6 md:w-3/5 md:p-8">
				<h3 className="text-xl font-bold md:text-2xl">{name}</h3>
				{description && <p className="text-base-content/70 text-sm md:text-base">{description}</p>}
				{website && <WebsiteLink website={website} />}
			</div>
		</div>
	);
}

function StandardCard({ logoUrl, logoAlt, name, website }: SponsorCardProps) {
	return (
		<div className="bg-surface flex flex-col items-center gap-4 rounded-xl p-5 shadow-md transition-shadow hover:shadow-lg">
			<SponsorLogo logoUrl={logoUrl} logoAlt={logoAlt} name={name} size="small" />
			<div className="flex flex-col items-center gap-2 text-center">
				<h3 className="text-base font-bold">{name}</h3>
				{website && <WebsiteLink website={website} />}
			</div>
		</div>
	);
}

function CompactCard({ logoUrl, logoAlt, name }: SponsorCardProps) {
	return (
		<div className="bg-surface flex flex-col items-center gap-3 rounded-xl p-4 shadow-md transition-shadow hover:shadow-lg">
			<SponsorLogo logoUrl={logoUrl} logoAlt={logoAlt} name={name} size="small" />
			<h3 className="text-sm font-semibold">{name}</h3>
		</div>
	);
}

export function SponsorCard(props: SponsorCardProps) {
	const { variant = 'standard' } = props;

	switch (variant) {
		case 'featured':
			return <FeaturedCard {...props} />;
		case 'compact':
			return <CompactCard {...props} />;
		default:
			return <StandardCard {...props} />;
	}
}
