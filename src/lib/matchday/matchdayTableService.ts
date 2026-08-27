import { cache } from 'react';
import { unwrap } from '@dejanvasic85/matchday-sdk';
import logger from '@/lib/logger';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';
import {
	type FixtureTeam,
	clubPlaceholderLogoUrl,
	getFixtureTeamsForLeague
} from '@/lib/matchday/matchdayClubService';
import { getLeagueMeta } from '@/lib/matchday/matchdayLeagueMetaService';
import type { TableData, TableEntry } from '@/types/table';

const log = logger.child({ service: 'matchdayTableService' });
const unresolvedTeamName = 'Unknown team';
const unresolvedClubName = 'Unknown club';

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

/** Never drops a row — an unresolved team still holds its ladder position, just with a
 * placeholder name/logo, so the table doesn't render with a gap in position numbering
 * (1, 2, 4, ...) and no indication a row went missing. */
function mapTableEntry(entry: MatchdayTableEntry, teamsById: Map<string, FixtureTeam>): TableEntry {
	const team = teamsById.get(entry.teamId);
	if (!team) {
		log.warn({ teamId: entry.teamId }, 'matchday table entry references an unresolved team');
	}

	return {
		teamId: entry.teamId,
		teamName: team?.teamName ?? unresolvedTeamName,
		clubName: team?.club.name ?? unresolvedClubName,
		logoUrl: team?.club.logoUrl ?? clubPlaceholderLogoUrl,
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

/** `cache()`-wrapped, same reasoning as `getMatchdayFixturesForLeague`. */
export const getMatchdayTableForLeague = cache(async (leagueId: string): Promise<TableData> => {
	const [tableOutcome, teamsById, { competition, season }] = await Promise.all([
		getMatchdayClient().GET('/leagues/{id}/table', { params: { path: { id: leagueId } } }),
		getFixtureTeamsForLeague(leagueId),
		getLeagueMeta(leagueId)
	]);

	const table = unwrap(tableOutcome);
	if (!table.ok) {
		throw new Error(`Failed to load table for league ${leagueId}: ${table.error.message}`);
	}

	const entries = table.value
		.map((entry) => mapTableEntry(entry, teamsById))
		.sort((a, b) => a.position - b.position);

	return { season, competition, entries };
});
