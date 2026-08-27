import { cache } from 'react';
import { getLeagueTeams } from '@dejanvasic85/matchday-sdk';
import logger from '@/lib/logger';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';
import { clubSchema } from '@/types/matches';
import type { Club } from '@/types/matches';

const log = logger.child({ service: 'matchdayClubService' });
export const clubPlaceholderLogoUrl = '/img/club-placeholder.svg';

type MatchdayClubSummary = {
	id: string;
	name: string;
	displayName: string;
	logoUrl: string | null;
};

export type FixtureTeam = {
	club: Club;
	teamName: string;
};

function mapMatchdayClub(club: MatchdayClubSummary): Club | null {
	const result = clubSchema.safeParse({
		externalId: club.id,
		name: club.name,
		displayName: club.displayName,
		logoUrl: club.logoUrl ?? clubPlaceholderLogoUrl
	});
	return result.success ? result.data : null;
}

/**
 * Maps a league's team ids to their club + team name, for rendering fixture/table opponents.
 * Fixtures/table entries only carry a team id, so they need this join to render a name or badge.
 *
 * League-scoped rather than the full `/teams` + `/clubs` catalog this used to fetch and join in
 * memory: that was ~6500 teams and 2.4 MB to resolve the handful one league actually plays.
 *
 * `cache()`-wrapped for per-request memoization: a team's layout and page each resolve fixtures
 * and the table, so one render asks for the same league's teams three times.
 */
export const getFixtureTeamsForLeague = cache(
	async (leagueId: string): Promise<Map<string, FixtureTeam>> => {
		const result = await getLeagueTeams(getMatchdayClient(), leagueId);

		if (!result.ok) {
			throw new Error(`Failed to load teams for league ${leagueId}: ${result.error.message}`);
		}

		const teamsById = new Map<string, FixtureTeam>();
		for (const team of result.value) {
			// Teams not yet bridged to a club are the rare, self-healing exception. Leaving them out
			// means the table renders their row with a placeholder name/logo, and any fixture they
			// appear in is dropped, which is what the previous null-`clubId` skip did too.
			if (team.type !== 'club') {
				log.warn({ teamId: team.id }, 'matchday team is not affiliated to a club, skipping');
				continue;
			}

			const club = mapMatchdayClub(team.club);
			if (!club) {
				log.warn({ clubId: team.club.id }, 'matchday club failed schema validation, skipping');
				continue;
			}

			teamsById.set(team.id, { club, teamName: team.name });
		}

		return teamsById;
	}
);
