import { cache } from 'react';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';

const matchdayRequestTimeoutMs = 10_000;

export type LeagueMeta = {
	competition: string;
	season: number;
};

/** Resolves a league's competition/season display names — two targeted GET /{id} calls, not
 * the full-catalog fetch used for the league picker (this is one league, not many).
 * `cache()`-wrapped, same reasoning as `getMatchdayFixturesForLeague`. */
export const getLeagueMeta = cache(async function getLeagueMeta(
	leagueId: string
): Promise<LeagueMeta> {
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
});
