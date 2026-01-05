import Link from 'next/link';

type KeyDatesSectionProps = {
	heading?: string;
	leadingText?: string;
};

const defaultLeadingText = 'See all the important dates for the upcoming season.';

export function KeyDatesSection({ heading, leadingText }: KeyDatesSectionProps) {
	return (
		<div className="bg-secondary/10 border-secondary/30 flex h-full flex-col justify-between gap-4 rounded-2xl border p-6 md:flex-row md:items-start md:p-8">
			<div>
				<h2 className="mb-2 text-2xl font-bold md:text-3xl">{heading}</h2>
				<p className="text-base-content/70 text-base md:text-lg">
					{leadingText || defaultLeadingText}
				</p>
			</div>
			<div className="flex justify-center md:justify-end">
				<Link href="/key-dates" className="btn btn-secondary shrink-0">
					View Key Dates
				</Link>
			</div>
		</div>
	);
}
