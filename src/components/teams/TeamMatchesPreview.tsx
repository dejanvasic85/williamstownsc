import Image from 'next/image';
import Link from 'next/link';
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
import type { EnrichedFixture } from '@/types/matches';

type TeamMatchesPreviewProps = {
	nextMatch: EnrichedFixture | null;
	previousMatch: EnrichedFixture | null;
	teamSlug: string;
};

type MatchPreviewCardProps = {
	title: string;
	fixture: EnrichedFixture;
	showScore?: boolean;
};

function MatchTeamRow({
	logoUrl,
	displayName,
	score
}: {
	logoUrl: string;
	displayName: string;
	score?: number | null;
}) {
	return (
		<div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
			<Image
				src={logoUrl}
				alt={displayName}
				width={36}
				height={36}
				className="h-9 w-9 object-contain"
			/>
			<span className="text-sm font-medium">{displayName}</span>
			{score != null && <span className="text-lg font-bold tabular-nums">{score}</span>}
		</div>
	);
}

const melbourneTimezone = 'Australia/Melbourne';

function MatchPreviewCard({ title, fixture, showScore = false }: MatchPreviewCardProps) {
	const [year, month, day] = fixture.date.split('-').map(Number);
	const [hour, minute] = fixture.time.split(':').map(Number);
	const matchDateTime = new TZDate(year, month - 1, day, hour, minute, melbourneTimezone);
	const formattedDate = format(matchDateTime, 'EEE d MMM yyyy');
	const formattedTime = format(matchDateTime, 'h:mm a');

	return (
		<div className="border-base-300 flex flex-col gap-4 rounded-xl border p-5">
			<h3 className="text-base font-bold tracking-wide uppercase">{title}</h3>

			<time dateTime={`${fixture.date}T${fixture.time}`} className="text-base-content/60 text-sm">
				{formattedDate} · {formattedTime}
			</time>

			<div className="flex flex-col gap-2">
				<MatchTeamRow
					logoUrl={fixture.homeTeam.logoUrl}
					displayName={fixture.homeTeam.displayName}
					score={showScore ? fixture.homeScore : undefined}
				/>
				<MatchTeamRow
					logoUrl={fixture.awayTeam.logoUrl}
					displayName={fixture.awayTeam.displayName}
					score={showScore ? fixture.awayScore : undefined}
				/>
			</div>

			{fixture.address && (
				<div className="text-base-content/60 flex items-start gap-1.5 text-sm">
					<MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
					<span>{fixture.address}</span>
				</div>
			)}
		</div>
	);
}

export function TeamMatchesPreview({
	nextMatch,
	previousMatch,
	teamSlug
}: TeamMatchesPreviewProps) {
	if (!nextMatch && !previousMatch) {
		return null;
	}

	return (
		<div className="mt-8 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-black uppercase">Matches</h2>
				<Link
					href={`/football/teams/${teamSlug}/matches`}
					className="btn btn-primary btn-outline btn-sm"
				>
					View All Fixtures
				</Link>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				{previousMatch && (
					<MatchPreviewCard title="Last Result" fixture={previousMatch} showScore />
				)}
				{nextMatch && <MatchPreviewCard title="Next Match" fixture={nextMatch} />}
			</div>
		</div>
	);
}
