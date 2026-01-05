import Link from 'next/link';

type KeyDatesSectionProps = {
	heading?: string;
	leadingText?: string;
};

const defaultLeadingText = 'See all the important dates for the upcoming season.';

export function KeyDatesSection({ heading, leadingText }: KeyDatesSectionProps) {
	return (
		<div className="bg-secondary/10 border-secondary/30 flex h-full flex-col rounded-2xl border p-8">
			<h2 className="mb-2 text-2xl font-bold md:text-3xl">{heading}</h2>
			<p className="text-base-content/70 mb-6 flex-1 text-lg">
				{leadingText || defaultLeadingText}
			</p>
			<div>
				<Link href="/key-dates" className="btn btn-secondary">
					View Key Dates
				</Link>
			</div>
		</div>
	);
}
