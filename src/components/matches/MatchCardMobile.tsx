import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { EnrichedFixture } from '@/types/matches';

type MatchCardMobileProps = {
	fixture: EnrichedFixture;
	formattedDate: string;
	formattedTime: string;
};

export function MatchCardMobile({ fixture, formattedDate, formattedTime }: MatchCardMobileProps) {
	const hasScores = fixture.homeScore != null && fixture.awayScore != null;

	return (
		<div className="flex flex-col gap-3">
			{/* Date and Time */}
			<time
				dateTime={`${fixture.date}T${fixture.time}`}
				className="text-base-content/60 flex items-baseline gap-1.5 text-sm"
			>
				<span>{formattedDate}</span>
				<span>{formattedTime}</span>
			</time>

			{/* Teams - Vertical Stack */}
			<div className="flex flex-col gap-3">
				{/* Home Team */}
				<div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
					<Image
						src={fixture.homeTeam.logoUrl}
						alt={fixture.homeTeam.displayName}
						width={40}
						height={40}
						className="h-10 w-10 object-contain"
						unoptimized
					/>
					<span className="text-base font-medium">{fixture.homeTeam.displayName}</span>
					{hasScores && <span className="text-xl font-bold tabular-nums">{fixture.homeScore}</span>}
				</div>

				{/* Away Team */}
				<div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
					<Image
						src={fixture.awayTeam.logoUrl}
						alt={fixture.awayTeam.displayName}
						width={40}
						height={40}
						className="h-10 w-10 object-contain"
						unoptimized
					/>
					<span className="text-base font-medium">{fixture.awayTeam.displayName}</span>
					{hasScores && <span className="text-xl font-bold tabular-nums">{fixture.awayScore}</span>}
				</div>
			</div>

			{/* Venue */}
			<div className="text-base-content/60 grid grid-cols-[auto_1fr] items-start gap-1.5 text-sm">
				<MapPin className="mt-0.5 h-4 w-4" aria-hidden="true" />
				<span>{fixture.address}</span>
			</div>
		</div>
	);
}
