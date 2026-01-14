import type { EnrichedFixture } from '@/types/matches';
import { MatchCard } from './MatchCard';

type MatchListProps = {
	fixtures: EnrichedFixture[];
};

type FixturesByRound = {
	round: number;
	fixtures: EnrichedFixture[];
};

function groupFixturesByRound(fixtures: EnrichedFixture[]): FixturesByRound[] {
	const grouped = fixtures.reduce((acc, fixture) => {
		const existing = acc.find((item) => item.round === fixture.round);
		if (existing) {
			existing.fixtures.push(fixture);
		} else {
			acc.push({ round: fixture.round, fixtures: [fixture] });
		}
		return acc;
	}, [] as FixturesByRound[]);

	grouped.forEach((group) => {
		group.fixtures.sort((a, b) => {
			const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
			if (dateCompare !== 0) return dateCompare;
			return a.time.localeCompare(b.time);
		});
	});

	return grouped.sort((a, b) => a.round - b.round);
}

export function MatchList({ fixtures }: MatchListProps) {
	const fixturesByRound = groupFixturesByRound(fixtures);

	return (
		<div className="space-y-6">
			{fixturesByRound.map(({ round, fixtures: roundFixtures }) => (
				<article key={round} className="card bg-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl md:text-2xl">Round {round}</h2>
						<ul className="list">
							{roundFixtures.map((fixture, index) => (
								<MatchCard
									key={`${fixture.round}-${fixture.date}-${fixture.time}-${index}`}
									fixture={fixture}
								/>
							))}
						</ul>
					</div>
				</article>
			))}
		</div>
	);
}
