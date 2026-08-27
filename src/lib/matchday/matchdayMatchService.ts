import { cache } from 'react';
import { unwrap } from '@dejanvasic85/matchday-sdk';
import logger from '@/lib/logger';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';
import { type FixtureTeam, getFixtureTeamsForLeague } from '@/lib/matchday/matchdayClubService';
import { fixtureStatusValue } from '@/lib/matches/fixtureStatusService';
import type { EnrichedFixture } from '@/types/matches';

const log = logger.child({ service: 'matchdayMatchService' });
const melbourneTimezone = 'Australia/Melbourne';

type MatchdayFixtureStatus = 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';

type MatchdayFixture = {
	id: string;
	round: number | null;
	homeTeamId: string | null;
	awayTeamId: string | null;
	venue: string | null;
	latitude: number | null;
	longitude: number | null;
	kickoffAt: string | null;
	status: MatchdayFixtureStatus;
	homeScore: number | null;
	awayScore: number | null;
	isBye: boolean;
};

function mapStatus(status: MatchdayFixtureStatus): string {
	return status === 'completed' ? fixtureStatusValue.complete : status;
}

function formatKickoff(kickoffAt: string): { date: string; time: string; day: string } {
	const kickoff = new Date(kickoffAt);
	const date = kickoff.toLocaleDateString('en-CA', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: melbourneTimezone
	});
	const time = kickoff.toLocaleTimeString('en-AU', {
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
		timeZone: melbourneTimezone
	});
	const day = kickoff.toLocaleDateString('en-AU', {
		weekday: 'long',
		timeZone: melbourneTimezone
	});
	return { date, time, day };
}

function mapFixture(
	fixture: MatchdayFixture,
	teamsById: Map<string, FixtureTeam>
): EnrichedFixture | null {
	if (fixture.isBye || fixture.round === null || !fixture.kickoffAt) {
		return null;
	}

	if (!fixture.homeTeamId || !fixture.awayTeamId) {
		log.warn({ fixtureId: fixture.id }, 'non-bye matchday fixture missing a team id');
		return null;
	}

	const homeTeam = teamsById.get(fixture.homeTeamId);
	const awayTeam = teamsById.get(fixture.awayTeamId);
	if (!homeTeam || !awayTeam) {
		log.warn({ fixtureId: fixture.id }, 'matchday fixture references an unresolved team');
		return null;
	}

	const { date, time, day } = formatKickoff(fixture.kickoffAt);

	return {
		round: fixture.round,
		date,
		day,
		time,
		homeTeam: homeTeam.club,
		awayTeam: awayTeam.club,
		homeTeamDisplayName: homeTeam.teamName,
		awayTeamDisplayName: awayTeam.teamName,
		address: fixture.venue ?? '',
		coordinates:
			fixture.latitude != null && fixture.longitude != null
				? `${fixture.latitude},${fixture.longitude}`
				: '',
		homeScore: fixture.homeScore ?? undefined,
		awayScore: fixture.awayScore ?? undefined,
		status: mapStatus(fixture.status)
	};
}

/** All non-bye fixtures for a league. No Data Cache layer: the API caches upstream and the route's
 * `revalidate` bounds how often this runs, so `cache()` only dedupes within one render. */
export const getMatchdayFixturesForLeague = cache(
	async (leagueId: string): Promise<EnrichedFixture[]> => {
		const [fixturesOutcome, teamsById] = await Promise.all([
			getMatchdayClient().GET('/leagues/{id}/fixtures', { params: { path: { id: leagueId } } }),
			getFixtureTeamsForLeague(leagueId)
		]);

		const fixtures = unwrap(fixturesOutcome);
		if (!fixtures.ok) {
			throw new Error(`Failed to load fixtures for league ${leagueId}: ${fixtures.error.message}`);
		}

		return fixtures.value
			.map((fixture) => mapFixture(fixture, teamsById))
			.filter((fixture): fixture is EnrichedFixture => fixture !== null)
			.sort((a, b) => a.round - b.round);
	}
);
