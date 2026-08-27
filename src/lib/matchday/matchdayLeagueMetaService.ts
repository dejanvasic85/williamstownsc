import { cache } from 'react';
import { unwrap } from '@dejanvasic85/matchday-sdk';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';

export type LeagueMeta = {
	competition: string;
	season: number;
};

/** A league's competition/season display names. One request: `League` embeds both as summaries,
 * so this no longer chases `/competitions/{id}` and `/seasons/{id}` afterwards. `cache()`-wrapped
 * for per-request memoization, same reasoning as `getFixtureTeamsForLeague`. */
export const getLeagueMeta = cache(async (leagueId: string): Promise<LeagueMeta> => {
	const league = unwrap(
		await getMatchdayClient().GET('/leagues/{id}', { params: { path: { id: leagueId } } })
	);

	if (!league.ok) {
		throw new Error(`Failed to load league ${leagueId}: ${league.error.message}`);
	}

	return {
		competition: league.value.competition.name,
		season: Number(league.value.season.name) || new Date().getFullYear()
	};
});
