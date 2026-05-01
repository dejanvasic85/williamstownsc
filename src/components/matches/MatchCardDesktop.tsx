import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { EnrichedFixture } from '@/types/matches';

type MatchCardDesktopProps = {
	fixture: EnrichedFixture;
	formattedDate: string;
	formattedTime: string;
};

function renderScore(fixture: EnrichedFixture) {
	switch (fixture.status) {
		case 'complete':
			if (fixture.homeScore == null || fixture.awayScore == null) {
				return <span className="text-base-content/50">-</span>;
			}
			return (
				<span className="text-lg font-bold tabular-nums">
					{fixture.homeScore} - {fixture.awayScore}
				</span>
			);
		case 'washout reschedule':
			return <span className="badge badge-neutral">Postponed</span>;
		default:
			return <span className="text-base-content/50">-</span>;
	}
}

export function MatchCardDesktop({ fixture, formattedDate, formattedTime }: MatchCardDesktopProps) {
	return (
		<div className="flex flex-col gap-2">
			{/* Teams Grid */}
			<div className="grid grid-cols-[20%_1fr_auto_1fr] items-center gap-6">
				{/* Column 1: Date and Time (20%) */}
				<div className="flex flex-col gap-2">
					<time
						dateTime={`${fixture.date}T${fixture.time}`}
						className="text-base-content/80 flex items-center gap-1"
					>
						<span className="text-base font-medium">
							{formattedDate} {formattedTime}
						</span>
					</time>
					<a
						href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fixture.address)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-base-content/70 hover:text-base-content flex items-start gap-1.5 text-sm transition-colors"
					>
						<MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
						<span>{fixture.address}</span>
					</a>
				</div>

				{/* Column 2: Home Team Name (right-aligned) */}
				<div className="flex items-center justify-end">
					<span className="text-base font-medium">{fixture.homeTeamDisplayName}</span>
				</div>

				{/* Column 3: Logos and Score */}
				<div className="flex items-center gap-3">
					<Image
						src={fixture.homeTeam.logoUrl}
						alt={fixture.homeTeamDisplayName}
						width={40}
						height={40}
						className="h-10 w-10 object-contain"
						unoptimized
					/>
					{renderScore(fixture)}
					<Image
						src={fixture.awayTeam.logoUrl}
						alt={fixture.awayTeamDisplayName}
						width={40}
						height={40}
						className="h-10 w-10 object-contain"
						unoptimized
					/>
				</div>

				{/* Column 4: Away Team Name (left-aligned) */}
				<div className="flex items-center justify-start">
					<span className="text-base font-medium">{fixture.awayTeamDisplayName}</span>
				</div>
			</div>
		</div>
	);
}
