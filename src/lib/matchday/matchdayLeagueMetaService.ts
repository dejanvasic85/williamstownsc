import { unstable_cache } from 'next/cache';
import { getMatchdayClient, matchdayRequestTimeoutMs } from '@/lib/matchday/matchdayClient';

export type LeagueMeta = {
	competition: string;
	season: number;
};

async function loadLeagueMeta(leagueId: string): Promise<LeagueMeta> {
	const client = getMatchdayClient();
	const signal = AbortSignal.timeout(matchdayRequestTimeoutMs);

	const leagueResult = await client.GET('/leagues/{id}', {
		params: { path: { id: leagueId } },
		signal
	});

	if (leagueResult.error || !leagueResult.data) {
		throw new Error(`Failed to load league ${leagueId}`);
	}

	const [competitionResult, seasonResult] = await Promise.all([
		client.GET('/competitions/{id}', {
			params: { path: { id: leagueResult.data.competitionId } },
			signal
		}),
		client.GET('/seasons/{id}', { params: { path: { id: leagueResult.data.seasonId } }, signal })
	]);

	return {
		competition: competitionResult.data?.name ?? leagueResult.data.competitionId,
		season: Number(seasonResult.data?.name) || new Date().getFullYear()
	};
}

/** Resolves a league's competition/season display names — two targeted GET /{id} calls, not
 * the full-catalog fetch used for the league picker (this is one league, not many).
 * `unstable_cache()`-wrapped, same reasoning as `getMatchdayFixturesForLeague`. */
export const getLeagueMeta = unstable_cache(loadLeagueMeta, ['matchday-league-meta'], {
	revalidate: 300,
	tags: ['matchday-league-meta']
});
