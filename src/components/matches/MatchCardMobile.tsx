import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { EnrichedFixture } from '@/types/matches';

type MatchCardMobileProps = {
	fixture: EnrichedFixture;
	formattedDate: string;
	formattedTime: string;
};

export function MatchCardMobile({ fixture, formattedDate, formattedTime }: MatchCardMobileProps) {
	const isComplete = fixture.status === 'complete';
	const isWashout = fixture.status === 'washout reschedule';

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
					/>
					<span className="text-base font-medium">{fixture.homeTeam.displayName}</span>
					{isComplete && fixture.homeScore != null && (
						<span className="text-xl font-bold tabular-nums">{fixture.homeScore}</span>
					)}
				</div>

				{/* Away Team */}
				<div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
					<Image
						src={fixture.awayTeam.logoUrl}
						alt={fixture.awayTeam.displayName}
						width={40}
						height={40}
						className="h-10 w-10 object-contain"
					/>
					<span className="text-base font-medium">{fixture.awayTeam.displayName}</span>
					{isComplete && fixture.awayScore != null && (
						<span className="text-xl font-bold tabular-nums">{fixture.awayScore}</span>
					)}
				</div>
			</div>

			{isWashout && <span className="badge badge-neutral">Postponed</span>}

			{/* Venue */}
			<a
				href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fixture.address)}`}
				target="_blank"
				rel="noopener noreferrer"
				className="text-base-content/60 hover:text-base-content grid grid-cols-[auto_1fr] items-start gap-1.5 text-sm transition-colors"
			>
				<MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
				<span>{fixture.address}</span>
			</a>
		</div>
	);
}
