import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function KeyDatesSection() {
	return (
		<section className="container mx-auto px-4 py-8">
			<div className="bg-secondary/10 border-secondary/30 rounded-2xl border p-8 md:p-10">
				<div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
					<div className="bg-secondary/20 shrink-0 rounded-full p-4">
						<Calendar className="text-secondary h-10 w-10" />
					</div>
					<div className="flex-1">
						<h2 className="mb-2 text-2xl font-bold md:text-3xl">Key Dates 2026</h2>
						<p className="text-base-content/70 text-lg">
							See all the important dates for the upcoming season.
						</p>
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
