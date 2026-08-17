import { unstable_cache } from 'next/cache';
import logger from '@/lib/logger';
import { getMatchdayClient, matchdayRequestTimeoutMs } from '@/lib/matchday/matchdayClient';
import { type FixtureTeam, getFixtureTeamsById } from '@/lib/matchday/matchdayClubService';
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

/** Mirrors the two statuses the UI already special-cases, plus the matchday-only ones added
 * alongside (docs/plans/2026-08-15-matchday-fixtures-table-swap.md). */
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

async function loadFixturesForLeague(leagueId: string): Promise<EnrichedFixture[]> {
	const client = getMatchdayClient();
	const signal = AbortSignal.timeout(matchdayRequestTimeoutMs);
	const [fixturesResult, teamsById] = await Promise.all([
		client.GET('/leagues/{id}/fixtures', { params: { path: { id: leagueId } }, signal }),
		getFixtureTeamsById()
	]);

	if (fixturesResult.error || !fixturesResult.data) {
		throw new Error(`Failed to load fixtures for league ${leagueId}`);
	}

	return fixturesResult.data
		.map((fixture) => mapFixture(fixture, teamsById))
		.filter((fixture): fixture is EnrichedFixture => fixture !== null)
		.sort((a, b) => a.round - b.round);
}

/** All non-bye, mapped fixtures for a league — the matchday equivalent of a team's
 * `data/matches/{slug}.json`, which is scoped per-league too, not per-team.
 * `unstable_cache()`-wrapped (Next's Data Cache, shared across the whole build/all requests
 * within the revalidate window) — a team's /matches and /table pages are separate static-
 * generation passes, so per-request memoization alone doesn't share this across them. */
export const getMatchdayFixturesForLeague = unstable_cache(
	loadFixturesForLeague,
	['matchday-fixtures'],
	{ revalidate: 300, tags: ['matchday-fixtures'] }
);
