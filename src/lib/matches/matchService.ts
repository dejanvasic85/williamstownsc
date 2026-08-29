import * as Sentry from '@sentry/nextjs';
import { getMatchdayClubId } from '@/lib/content/siteSettings';
import { getTeamLeagueId } from '@/lib/content/teamDetail';
import logger from '@/lib/logger';
import { getLeagueMeta } from '@/lib/matchday/matchdayLeagueMetaService';
import { getMatchdayFixturesForLeague } from '@/lib/matchday/matchdayMatchService';
import {
	resolveMatchdayNextMatch,
	resolveMatchdayPreviousMatch
} from '@/lib/matches/matchResolverService';
import type { EnrichedFixture } from '@/types/matches';

const log = logger.child({ service: 'matchService' });

type MatchdayContext = {
	fixtures: EnrichedFixture[];
	matchdayClubId: string | null;
};

/** Returns null on API failure, so an outage degrades to "no next/previous match" rather than
 * a 500. */
async function loadMatchdayContext(leagueId: string): Promise<MatchdayContext | null> {
	try {
		const [fixtures, matchdayClubId] = await Promise.all([
			getMatchdayFixturesForLeague(leagueId),
			getMatchdayClubId()
		]);
		return { fixtures, matchdayClubId };
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error, leagueId }, 'failed to load matchday fixtures');
		return null;
	}
}

export async function getFixturesForTeam(slug: string): Promise<{
	fixtures: EnrichedFixture[];
	competition: string;
	season: number;
} | null> {
	const leagueId = await getTeamLeagueId(slug);
	if (!leagueId) {
		return null;
	}

	try {
		const [fixtures, { competition, season }] = await Promise.all([
			getMatchdayFixturesForLeague(leagueId),
			getLeagueMeta(leagueId)
		]);
		return { fixtures, competition, season };
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error, leagueId }, 'failed to load matchday fixtures');
		return null;
	}
}

export async function hasFixtures(slug: string): Promise<boolean> {
	const leagueId = await getTeamLeagueId(slug);
	if (!leagueId) {
		return false;
	}

	try {
		const fixtures = await getMatchdayFixturesForLeague(leagueId);
		return fixtures.length > 0;
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error, leagueId }, 'failed to load matchday fixtures');
		return false;
	}
}

export async function getTeamMatches(teamSlug: string): Promise<{
	hasFixtures: boolean;
	nextMatch: EnrichedFixture | null;
	previousMatch: EnrichedFixture | null;
}> {
	const leagueId = await getTeamLeagueId(teamSlug);
	if (!leagueId) {
		return { hasFixtures: false, nextMatch: null, previousMatch: null };
	}

	const context = await loadMatchdayContext(leagueId);

	if (!context || context.fixtures.length === 0 || !context.matchdayClubId) {
		return {
			hasFixtures: Boolean(context?.fixtures.length),
			nextMatch: null,
			previousMatch: null
		};
	}

	return {
		hasFixtures: true,
		nextMatch: resolveMatchdayNextMatch(context.fixtures, context.matchdayClubId),
		previousMatch: resolveMatchdayPreviousMatch(context.fixtures, context.matchdayClubId)
	};
}

export async function getNextMatch(teamSlug: string): Promise<EnrichedFixture | null> {
	const leagueId = await getTeamLeagueId(teamSlug);
	if (!leagueId) {
		return null;
	}

	const context = await loadMatchdayContext(leagueId);
	return context?.matchdayClubId
		? resolveMatchdayNextMatch(context.fixtures, context.matchdayClubId)
		: null;
}

export async function getPreviousMatch(teamSlug: string): Promise<EnrichedFixture | null> {
	const leagueId = await getTeamLeagueId(teamSlug);
	if (!leagueId) {
		return null;
	}

	const context = await loadMatchdayContext(leagueId);
	return context?.matchdayClubId
		? resolveMatchdayPreviousMatch(context.fixtures, context.matchdayClubId)
		: null;
}
