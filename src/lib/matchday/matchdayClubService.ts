import { cache } from 'react';
import logger from '@/lib/logger';
import { getMatchdayClient, matchdayRequestTimeoutMs } from '@/lib/matchday/matchdayClient';
import { clubSchema } from '@/types/matches';
import type { Club } from '@/types/matches';

const log = logger.child({ service: 'matchdayClubService' });
export const clubPlaceholderLogoUrl = '/img/club-placeholder.svg';

type MatchdayClub = {
	id: string;
	name: string;
	logoUrl: string | null;
};

export type FixtureTeam = {
	club: Club;
	teamName: string;
};

function mapMatchdayClub(club: MatchdayClub): Club | null {
	const result = clubSchema.safeParse({
		externalId: club.id,
		name: club.name,
		displayName: club.name,
		logoUrl: club.logoUrl ?? clubPlaceholderLogoUrl
	});
	return result.success ? result.data : null;
}

/**
 * Maps every matchday team id to its club + team name, for rendering fixture/table opponents.
 * Fixtures/table entries only carry a team id (no club or name data inline), and there's no
 * batch-by-id or by-league filter on /teams or /clubs, so this fetches both full catalogs and
 * joins in memory — same tradeoff already accepted in leagueOptionService.ts. `cache()`-wrapped
 * so multiple fixtures/table calls in one request share it instead of re-fetching both catalogs
 * each time.
 */
export const getFixtureTeamsById = cache(async function getFixtureTeamsById(): Promise<
	Map<string, FixtureTeam>
> {
	const client = getMatchdayClient();
	const signal = AbortSignal.timeout(matchdayRequestTimeoutMs);
	const [teamsResult, clubsResult] = await Promise.all([
		client.GET('/teams', { signal }),
		client.GET('/clubs', { signal })
	]);

	if (teamsResult.error || !teamsResult.data) {
		throw new Error('Failed to load teams from the matchday API');
	}
	if (clubsResult.error || !clubsResult.data) {
		throw new Error('Failed to load clubs from the matchday API');
	}

	const clubsById = new Map(clubsResult.data.map((club) => [club.id, club]));

	const fixtureTeamsById = new Map<string, FixtureTeam>();
	for (const team of teamsResult.data) {
		if (!team.clubId) {
			continue;
		}

		const club = clubsById.get(team.clubId);
		if (!club) {
			log.warn({ teamId: team.id, clubId: team.clubId }, 'matchday team references unknown club');
			continue;
		}

		const mappedClub = mapMatchdayClub(club);
		if (!mappedClub) {
			log.warn({ clubId: club.id }, 'matchday club failed schema validation, skipping');
			continue;
		}

		fixtureTeamsById.set(team.id, { club: mappedClub, teamName: team.name });
	}

	return fixtureTeamsById;
});
