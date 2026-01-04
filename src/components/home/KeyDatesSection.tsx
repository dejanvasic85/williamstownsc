import Link from 'next/link';
import { Calendar } from 'lucide-react';

type KeyDatesSectionProps = {
	heading?: string;
	leadingText?: string;
};

const defaultLeadingText = 'See all the important dates for the upcoming season.';

export function KeyDatesSection({ heading, leadingText }: KeyDatesSectionProps) {
	return (
		<section className="container mx-auto mb-8">
			<div className="bg-secondary/10 border-secondary/30 rounded-2xl border p-8 md:p-10">
				<div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
					<div className="bg-secondary/20 shrink-0 rounded-full p-4">
						<Calendar className="text-secondary h-10 w-10" />
					</div>
					<div className="flex-1">
						<h2 className="mb-2 text-2xl font-bold md:text-3xl">{heading}</h2>
						<p className="text-base-content/70 text-lg">{leadingText || defaultLeadingText}</p>
					</div>
					<div className="shrink-0">
						<Link href="/key-dates" className="btn btn-secondary">
							View Key Dates
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
