import { unstable_cache } from 'next/cache';
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
 * Fetches + joins the full teams/clubs catalog. Extracted from getFixtureTeamsById so the
 * expensive part can be `unstable_cache()`-wrapped below — its return value must be JSON
 * serializable for Next's Data Cache, so this returns entries (a plain array), not a Map.
 */
async function loadFixtureTeamEntries(): Promise<[string, FixtureTeam][]> {
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

	const entries: [string, FixtureTeam][] = [];
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

		entries.push([team.id, { club: mappedClub, teamName: team.name }]);
	}

	return entries;
}

/**
 * `unstable_cache()`-wrapped (Next's Data Cache, shared across the whole build/all requests
 * within the revalidate window) rather than React's per-request `cache()` — this catalog is
 * identical for every matchday-backed team, but each team's /matches and /table page is a
 * separate static-generation pass, so per-request memoization alone still re-fetched it once
 * per page. With ~17 matchday-backed teams that was ~34 redundant full-catalog fetches in a
 * single build, which is almost certainly what caused the matchday API timeouts that broke
 * static generation for every matchday-backed team's /matches and /table routes.
 */
const loadFixtureTeamEntriesCached = unstable_cache(
	loadFixtureTeamEntries,
	['matchday-teams-clubs'],
	{
		revalidate: 300,
		tags: ['matchday-teams-clubs']
	}
);

/**
 * Maps every matchday team id to its club + team name, for rendering fixture/table opponents.
 * Fixtures/table entries only carry a team id (no club or name data inline), and there's no
 * batch-by-id or by-league filter on /teams or /clubs, so this fetches both full catalogs and
 * joins in memory — same tradeoff already accepted in leagueOptionService.ts.
 */
export async function getFixtureTeamsById(): Promise<Map<string, FixtureTeam>> {
	return new Map(await loadFixtureTeamEntriesCached());
}
