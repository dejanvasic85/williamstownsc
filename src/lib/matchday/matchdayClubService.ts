import { cache } from 'react';
import { getLeagueTeams } from '@dejanvasic85/matchday-sdk';
import { resolveTeamDisplayName } from '@/lib/clubService';
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
	/** Club name, falling back to the longer team name only when the club fields two sides in
	 * this league and the club name alone would be ambiguous. */
	displayName: string;
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

		const resolved: Array<{ id: string; club: Club; teamName: string }> = [];
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

			resolved.push({ id: team.id, club, teamName: team.name });
		}

		const teamCountByClubId = new Map<string, number>();
		for (const { club } of resolved) {
			teamCountByClubId.set(club.externalId, (teamCountByClubId.get(club.externalId) ?? 0) + 1);
		}

		return new Map(
			resolved.map(({ id, club, teamName }) => [
				id,
				{
					club,
					teamName,
					displayName: resolveTeamDisplayName(
						teamName,
						club,
						(teamCountByClubId.get(club.externalId) ?? 0) > 1
					)
				}
			])
		);
	}
);
