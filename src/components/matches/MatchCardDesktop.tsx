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
					<div className="text-base-content/70 text-sm">
						<span>{fixture.address}</span>
					</div>
				</div>

				{/* Column 2: Home Team Name (right-aligned) */}
				<div className="flex items-center justify-end">
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
				<div className="flex items-center justify-start">
					<span className="text-base font-medium">{fixture.awayTeam.displayName}</span>
				</div>
			</div>

			{/* Venue - Centered below teams */}
			<div className="flex items-center justify-center gap-2 text-sm text-base-content/70">
				<MapPin className="h-4 w-4" aria-hidden="true" />
				<span>{fixture.address}</span>
			</div>
		</div>
	);
}
