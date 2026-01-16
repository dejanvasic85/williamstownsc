import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';

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
					<div className="bg-secondary/20 mt-4 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<Calendar className="text-secondary mt-1 h-5 w-5 shrink-0" />
							<div>
								<p className="font-semibold">{nextKeyDate.title}</p>
								<p className="text-base-content/80 text-sm">
									{format(parseISO(nextKeyDate.date), 'EEEE, MMMM d, yyyy')}
								</p>
								{nextKeyDate.description && (
									<p className="text-base-content/70 mt-1 text-sm">{nextKeyDate.description}</p>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
