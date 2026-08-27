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

/** Team id to club + name, for rendering fixture and table opponents. `cache()`-wrapped because a
 * team's layout and page both resolve fixtures and the table, asking three times per render. */
export const getFixtureTeamsForLeague = cache(
	async (leagueId: string): Promise<Map<string, FixtureTeam>> => {
		const result = await getLeagueTeams(getMatchdayClient(), leagueId);

		if (!result.ok) {
			throw new Error(`Failed to load teams for league ${leagueId}: ${result.error.message}`);
		}

		const teamsById = new Map<string, FixtureTeam>();
		for (const team of result.value) {
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
