import { cache } from 'react';
import logger from '@/lib/logger';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';
import { type FixtureTeam, getFixtureTeamsById } from '@/lib/matchday/matchdayClubService';
import { getLeagueMeta } from '@/lib/matchday/matchdayLeagueMetaService';
import type { TableData, TableEntry } from '@/types/table';

const log = logger.child({ service: 'matchdayTableService' });
const matchdayRequestTimeoutMs = 10_000;

type MatchdayTableEntry = {
	teamId: string;
	position: number;
	played: number;
	won: number;
	drawn: number;
	lost: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
	points: number;
};

function mapTableEntry(
	entry: MatchdayTableEntry,
	teamsById: Map<string, FixtureTeam>
): TableEntry | null {
	const team = teamsById.get(entry.teamId);
	if (!team) {
		log.warn({ teamId: entry.teamId }, 'matchday table entry references an unresolved team');
		return null;
	}

	return {
		teamId: entry.teamId,
		teamName: team.teamName,
		clubName: team.club.name,
		logoUrl: team.club.logoUrl,
		position: entry.position,
		played: entry.played,
		wins: entry.won,
		draws: entry.drawn,
		losses: entry.lost,
		goalsFor: entry.goalsFor,
		goalsAgainst: entry.goalsAgainst,
		goalDifference: entry.goalDifference,
		points: entry.points
	};
}

/** `cache()`-wrapped, same reasoning as `getMatchdayFixturesForLeague` — layout + page both call
 * `getTableForTeam` per request. */
export const getMatchdayTableForLeague = cache(async function getMatchdayTableForLeague(
	leagueId: string
): Promise<TableData> {
	const client = getMatchdayClient();
	const signal = AbortSignal.timeout(matchdayRequestTimeoutMs);

	const [tableResult, teamsById, { competition, season }] = await Promise.all([
		client.GET('/leagues/{id}/table', { params: { path: { id: leagueId } }, signal }),
		getFixtureTeamsById(),
		getLeagueMeta(leagueId)
	]);

	if (tableResult.error || !tableResult.data) {
		throw new Error(`Failed to load table for league ${leagueId}`);
	}

	const entries = tableResult.data
		.map((entry) => mapTableEntry(entry, teamsById))
		.filter((entry): entry is TableEntry => entry !== null)
		.sort((a, b) => a.position - b.position);

	return { season, competition, entries };
});
