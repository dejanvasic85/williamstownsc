import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { EnrichedFixture } from '@/types/matches';

type MatchCardProps = {
	fixture: EnrichedFixture;
};

function formatMatchDate(dateStr: string, day: string): string {
	const date = new Date(dateStr);
	const dayOfMonth = date.getDate();
	const month = date.toLocaleDateString('en-AU', { month: 'short' });
	const year = date.getFullYear();
	return `${day} ${dayOfMonth} ${month} ${year}`;
}

export function MatchCard({ fixture }: MatchCardProps) {
	const formattedDate = formatMatchDate(fixture.date, fixture.day);

	return (
		<li className="border-base-200 list-row border-b py-4 last:border-b-0">
			<div className="grid grid-cols-1 gap-4 md:gap-6">
				{/* Date and Time */}
				<div className="flex flex-col items-start gap-1">
					<time className="text-sm font-semibold md:text-base">{formattedDate}</time>
					<time className="text-base-content/70 text-sm">{fixture.time}</time>
				</div>

				{/* Match Details */}
				<div className="flex flex-col gap-2">
					{/* Teams */}
					<div className="flex flex-wrap items-center gap-2 md:gap-3">
						<div className="flex items-center gap-2">
							<Image
								src={fixture.homeTeam.logoUrl}
								alt={fixture.homeTeam.displayName}
								width={32}
								height={32}
								className="h-8 w-8 object-contain md:h-10 md:w-10"
							/>
							<span className="text-sm font-medium md:text-base">
								{fixture.homeTeam.displayName}
							</span>
						</div>
						<span className="text-base-content/50">-</span>
						<div className="flex items-center gap-2">
							<Image
								src={fixture.awayTeam.logoUrl}
								alt={fixture.awayTeam.displayName}
								width={32}
								height={32}
								className="h-8 w-8 object-contain md:h-10 md:w-10"
							/>
							<span className="text-sm font-medium md:text-base">
								{fixture.awayTeam.displayName}
							</span>
						</div>
					</div>

					{/* Venue */}
					<div className="text-base-content/70 flex items-center gap-1 text-sm">
						<MapPin className="h-4 w-4" />
						<span>{fixture.address}</span>
					</div>
				</div>
			</div>
		</li>
	);
}
