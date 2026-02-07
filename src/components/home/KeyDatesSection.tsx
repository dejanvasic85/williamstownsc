import Link from 'next/link';
import { KeyDateCard } from '@/components/keyDates/KeyDateCard';

type KeyDatesSectionProps = {
	heading?: string;
	leadingText?: string;
	nextKeyDate?: {
		title: string;
		date: string;
		description?: string;
	} | null;
};

const defaultLeadingText = 'See all the important dates for the upcoming season.';

export function KeyDatesSection({ heading, leadingText, nextKeyDate }: KeyDatesSectionProps) {
	return (
		<div className="bg-secondary/10 border-secondary/30 dark:bg-surface dark:border-secondary flex h-full flex-col gap-4 border p-6 md:rounded-2xl md:p-8">
			<div className="flex items-start justify-between">
				<h2 className="text-2xl font-bold md:text-3xl">{heading}</h2>
				<Link href="/key-dates" className="btn btn-secondary shrink-0">
					View Key Dates
				</Link>
			</div>
			<div>
				<p className="text-base-content/70 text-base md:text-lg">
					{leadingText || defaultLeadingText}
				</p>
				{nextKeyDate && (
					<div className="mt-4">
						<KeyDateCard item={nextKeyDate} />
					</div>
				)}
			</div>
		</div>
	);
}
