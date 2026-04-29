'use client';

import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { MapPin } from 'lucide-react';
import type { EnrichedFixture } from '@/types/matches';
import { CountdownTimer } from './CountdownTimer';

type MatchColor = 'blue' | 'purple';

type MatchCountdownSectionProps = {
	match: EnrichedFixture | null;
	teamSlug: string;
	teamName: string;
	color: MatchColor;
};

const colorClasses: Record<MatchColor, { card: string; btn: string; countdown: string }> = {
	blue: {
		card: 'border-blue-300/30 bg-blue-100/40 dark:border-blue-500 dark:bg-surface',
		btn: 'btn-outline border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:hover:text-white',
		countdown: 'text-blue-500'
	},
	purple: {
		card: 'border-purple-300/30 bg-purple-100/40 dark:border-purple-500 dark:bg-surface',
		btn: 'btn-outline border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white dark:text-purple-400 dark:hover:text-white',
		countdown: 'text-purple-500'
	}
};

export function MatchCountdownSection({
	match,
	teamSlug,
	teamName,
	color
}: MatchCountdownSectionProps) {
	const classes = colorClasses[color];

	if (!match) {
		return (
			<div
				className={clsx(
					classes.card,
					'flex h-full flex-col justify-between gap-4 border p-6 md:flex-row md:items-start md:rounded-2xl md:p-8'
				)}
			>
				<div>
					<h2 className="mb-2 text-2xl font-bold md:text-3xl">{teamName} Next Match</h2>
					<p className="text-base-content/70 text-base md:text-lg">No upcoming matches scheduled</p>
				</div>
			</div>
		);
	}

	const matchDate = parseISO(match.date);
	const formattedDate = format(matchDate, 'EEE, MMMM d, yyyy');
	const formattedTime = format(parseISO(`${match.date}T${match.time}`), 'h:mm a');

	return (
		<div
			className={clsx(
				classes.card,
				'relative flex h-full flex-col gap-6 border p-6 md:rounded-2xl md:p-8'
			)}
		>
			<div className="flex items-start justify-between">
				<h2 className="mb-2 text-2xl font-bold md:text-3xl">{teamName} Next Match</h2>
				<Link
					href={`/football/teams/${teamSlug}/matches`}
					className={clsx('btn shrink-0', classes.btn)}
				>
					View Full Fixtures
				</Link>
			</div>

			<div className="flex flex-col items-center gap-6">
				<div className="flex items-center justify-center gap-6">
					<div className="flex flex-col items-center gap-2">
						<div className="relative h-20 w-20 md:h-28 md:w-28">
							<Image
								src={match.homeTeam.logoUrl}
								alt={match.homeTeam.displayName}
								fill
								className="object-contain"
								sizes="112px"
								unoptimized
							/>
						</div>
						<p className="text-center text-sm font-medium md:text-base">
							{match.homeTeam.displayName}
						</p>
					</div>

					<div className="text-base-content/50 text-3xl font-bold">vs</div>

					<div className="flex flex-col items-center gap-2">
						<div className="relative h-20 w-20 md:h-28 md:w-28">
							<Image
								src={match.awayTeam.logoUrl}
								alt={match.awayTeam.displayName}
								fill
								className="object-contain"
								sizes="112px"
								unoptimized
							/>
						</div>
						<p className="text-center text-sm font-medium md:text-base">
							{match.awayTeam.displayName}
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-1 text-center">
					<p className="text-base-content/90 text-base">
						{formattedDate} • {formattedTime}
					</p>
					{match.address && (
						<div className="text-base-content/70 flex items-center justify-center gap-1 text-base">
							<MapPin className="h-5 w-5" />
							<span>{match.address}</span>
						</div>
					)}
				</div>

				<CountdownTimer
					targetDate={match.date}
					targetTime={match.time}
					matchDurationMinutes={120}
					countdownClassName={classes.countdown}
				/>
			</div>
		</div>
	);
}
