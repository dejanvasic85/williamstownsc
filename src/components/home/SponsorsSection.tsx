import Image from 'next/image';
import Link from 'next/link';

interface Sponsor {
	_id: string;
	name: string;
	logo: {
		url: string;
		alt?: string;
	};
}

interface SponsorsSectionProps {
	sponsors: Sponsor[];
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
	if (sponsors.length === 0) {
		return null;
	}

	return (
		<div className="border-base-300 dark:border-primary bg-surface flex h-full flex-col justify-between gap-4 border p-6 md:flex-row md:items-start md:rounded-2xl md:p-8">
			<div>
				<h2 className="mb-2 text-2xl font-bold md:text-3xl">Our Sponsors</h2>
				<p className="text-base-content/70 text-base md:text-lg">
					Thank you to our partners for supporting the club.
				</p>
				<div className="mt-4 flex flex-wrap items-center justify-center gap-6 md:justify-start md:gap-8">
					{sponsors.map((sponsor) => (
						<div
							key={sponsor._id}
							className="flex h-20 w-28 items-center justify-center md:h-24 md:w-32"
						>
							<Image
								src={sponsor.logo.url}
								alt={sponsor.logo.alt || `${sponsor.name} logo`}
								width={160}
								height={120}
								className="h-auto max-h-16 w-auto rounded-lg object-contain md:max-h-20"
							/>
						</div>
					))}
				</div>
			</div>
			<div className="flex justify-center md:justify-end">
				<Link href="/sponsors" className="btn btn-primary btn-outline">
					View all sponsors
				</Link>
			</div>
		</div>
	);
}
