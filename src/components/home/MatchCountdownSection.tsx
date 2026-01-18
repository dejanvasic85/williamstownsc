'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { MapPin } from 'lucide-react';
import type { EnrichedFixture } from '@/types/matches';
import { CountdownTimer } from './CountdownTimer';

type MatchCountdownSectionProps = {
	match: EnrichedFixture | null;
	teamSlug: string;
};

export function MatchCountdownSection({ match, teamSlug }: MatchCountdownSectionProps) {
	if (!match) {
		return (
			<div className="border-accent/30 bg-accent/10 dark:border-accent dark:bg-surface flex h-full flex-col justify-between gap-4 border p-6 md:flex-row md:items-start md:rounded-2xl md:p-8">
				<div>
					<h2 className="mb-2 text-2xl font-bold md:text-3xl">Next Match</h2>
					<p className="text-base-content/70 text-base md:text-lg">No upcoming matches scheduled</p>
				</div>
			</div>
		);
	}

	const matchDate = parseISO(match.date);
	const formattedDate = format(matchDate, 'EEE, MMMM d, yyyy');
	const formattedTime = format(parseISO(`${match.date}T${match.time}`), 'h:mm a');

	return (
		<div className="border-accent/30 bg-accent/10 dark:border-accent dark:bg-surface relative flex h-full flex-col gap-6 border p-6 md:rounded-2xl md:p-8">
			<div className="flex items-start justify-between">
				<h2 className="text-2xl font-bold md:text-3xl">Next Match</h2>
				<Link
					href={`/football/teams/${teamSlug}/matches`}
					className="btn btn-accent btn-outline shrink-0"
				>
					View Full Fixtures
				</Link>
			</div>

			<div className="flex flex-col items-center gap-6">
				<div className="flex items-center justify-center gap-4">
					<div className="flex flex-col items-center gap-2">
						<div className="relative h-16 w-16 md:h-20 md:w-20">
							<Image
								src={match.homeTeam.logoUrl}
								alt={match.homeTeam.displayName}
								fill
								className="object-contain"
							/>
						</div>
						<p className="text-center text-xs font-medium md:text-sm">
							{match.homeTeam.displayName}
						</p>
					</div>

					<div className="text-base-content/50 text-2xl font-bold">vs</div>

					<div className="flex flex-col items-center gap-2">
						<div className="relative h-16 w-16 md:h-20 md:w-20">
							<Image
								src={match.awayTeam.logoUrl}
								alt={match.awayTeam.displayName}
								fill
								className="object-contain"
							/>
						</div>
						<p className="text-center text-xs font-medium md:text-sm">
							{match.awayTeam.displayName}
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-1 text-center">
					<p className="text-base-content/90 text-sm">
						{formattedDate} • {formattedTime}
					</p>
					{match.address && (
						<div className="text-base-content/70 flex items-center justify-center gap-1 text-sm">
							<MapPin className="h-4 w-4" />
							<span>{match.address}</span>
						</div>
					)}
				</div>

				<CountdownTimer targetDate={match.date} targetTime={match.time} />
			</div>
		</div>
	);
}
