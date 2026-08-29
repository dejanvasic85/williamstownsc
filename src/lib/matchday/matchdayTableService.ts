import { cache } from 'react';
import { unwrap } from '@dejanvasic85/matchday-sdk';
import logger from '@/lib/logger';
import { createMatchdayLeagueRequestInit } from '@/lib/matchday/matchdayCacheService';
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

/** Never drops a row: an unresolved team keeps its ladder position with a placeholder name and
 * logo, so positions don't render with a silent gap (1, 2, 4, ...). */
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

export const getMatchdayTableForLeague = cache(
	async (leagueId: string): Promise<TableData | null> => {
		const { competition, season, hasTable } = await getLeagueMeta(leagueId);
		if (!hasTable) {
			return null;
		}

		const [tableOutcome, teamsById] = await Promise.all([
			getMatchdayClient().GET('/leagues/{id}/table', {
				...createMatchdayLeagueRequestInit(leagueId),
				params: { path: { id: leagueId } }
			}),
			getFixtureTeamsForLeague(leagueId)
		]);

		const table = unwrap(tableOutcome);
		if (!table.ok) {
			throw new Error(`Failed to load table for league ${leagueId}: ${table.error.message}`);
		}

		const entries = table.value
			.map((entry) => mapTableEntry(entry, teamsById))
			.sort((a, b) => a.position - b.position);

		return { season, competition, entries };
	}
);
