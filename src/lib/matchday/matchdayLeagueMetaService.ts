import { cache } from 'react';
import { unwrap } from '@dejanvasic85/matchday-sdk';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';

export type LeagueMeta = {
	competition: string;
	season: number;
	hasTable: boolean;
};

/** A league's competition and season display names, and whether it publishes a table. */
export const getLeagueMeta = cache(async (leagueId: string): Promise<LeagueMeta> => {
	const league = unwrap(
		await getMatchdayClient().GET('/leagues/{id}', { params: { path: { id: leagueId } } })
	);

	if (!league.ok) {
		throw new Error(`Failed to load league ${leagueId}: ${league.error.message}`);
	}

	return {
		competition: league.value.competition.name,
		season: Number(league.value.season.name) || new Date().getFullYear(),
		hasTable: league.value.hasTable
	};
});
