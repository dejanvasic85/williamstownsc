import type { MatchdayRequestInit } from '@dejanvasic85/matchday-sdk';

const matchdayLeagueCacheTagPrefix = 'matchday:league';
const matchdayCacheRevalidationSeconds = 3600;

export function buildMatchdayLeagueCacheTag(leagueId: string): string {
	return `${matchdayLeagueCacheTagPrefix}:${leagueId}`;
}

export function createMatchdayLeagueRequestInit(leagueId: string): MatchdayRequestInit {
	return {
		next: {
			tags: [buildMatchdayLeagueCacheTag(leagueId)],
			revalidate: matchdayCacheRevalidationSeconds
		}
	};
}
