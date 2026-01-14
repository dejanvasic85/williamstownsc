import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { EnrichedFixture } from '@/types/matches';

type MatchCardDesktopProps = {
	fixture: EnrichedFixture;
	formattedDate: string;
	formattedTime: string;
};

export function MatchCardDesktop({ fixture, formattedDate, formattedTime }: MatchCardDesktopProps) {
	return (
		<div className="flex flex-col gap-2">
			{/* Teams Grid - 4 columns for perfect alignment */}
			<div className="grid grid-cols-[20%_1fr_auto_1fr] items-center gap-6">
				{/* Column 1: Date and Time (20%) */}
				<time
					dateTime={`${fixture.date}T${fixture.time}`}
					className="text-base-content/60 flex flex-col gap-1"
				>
					<span className="text-base font-medium">{formattedDate}</span>
					<span className="text-sm">{formattedTime}</span>
				</time>

				{/* Column 2: Home Team Name (right-aligned) */}
				<div className="text-right">
					<span className="text-base font-medium">{fixture.homeTeam.displayName}</span>
				</div>

				{/* Column 3: Logos and Dash (fixed center) */}
				<div className="flex items-center gap-3">
					<Image
						src={fixture.homeTeam.logoUrl}
						alt={fixture.homeTeam.displayName}
						width={40}
						height={40}
						className="h-10 w-10 object-contain"
					/>
					<span className="text-base-content/50">-</span>
					<Image
						src={fixture.awayTeam.logoUrl}
						alt={fixture.awayTeam.displayName}
						width={40}
						height={40}
						className="h-10 w-10 object-contain"
					/>
				</div>

				{/* Column 4: Away Team Name (left-aligned) */}
				<div className="text-left">
					<span className="text-base font-medium">{fixture.awayTeam.displayName}</span>
				</div>
			</div>

			{/* Venue - Centered below */}
			<div className="text-base-content/60 flex items-center justify-center gap-1.5 text-sm">
				<MapPin className="h-4 w-4" />
				<span>{fixture.address}</span>
			</div>
		</div>
	);
}
