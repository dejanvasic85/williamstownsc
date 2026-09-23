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
import type { Tenant } from '@/tenants/schema/tenantSchema';
import type { EnrichedFixture } from '@/types/matches';

const log = logger.child({ service: 'matchService' });

type MatchdayContext = {
	fixtures: EnrichedFixture[];
	matchdayClubId: string | null;
};

/** Returns null on API failure, so an outage degrades to "no next/previous match" rather than
 * a 500. */
async function loadMatchdayContext(
	tenant: Tenant,
	leagueId: string
): Promise<MatchdayContext | null> {
	try {
		const [fixtures, matchdayClubId] = await Promise.all([
			getMatchdayFixturesForLeague(leagueId),
			getMatchdayClubId(tenant)
		]);
		return { fixtures, matchdayClubId };
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error, leagueId }, 'failed to load matchday fixtures');
		return null;
	}
}

export async function getFixturesForTeam(
	tenant: Tenant,
	slug: string
): Promise<{
	fixtures: EnrichedFixture[];
	competition: string;
	season: number;
} | null> {
	const leagueId = await getTeamLeagueId(tenant, slug);
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

export async function hasFixtures(tenant: Tenant, slug: string): Promise<boolean> {
	const leagueId = await getTeamLeagueId(tenant, slug);
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

export async function getTeamMatches(
	tenant: Tenant,
	teamSlug: string
): Promise<{
	hasFixtures: boolean;
	nextMatch: EnrichedFixture | null;
	previousMatch: EnrichedFixture | null;
}> {
	const leagueId = await getTeamLeagueId(tenant, teamSlug);
	if (!leagueId) {
		return { hasFixtures: false, nextMatch: null, previousMatch: null };
	}

	const context = await loadMatchdayContext(tenant, leagueId);

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

export async function getNextMatch(
	tenant: Tenant,
	teamSlug: string
): Promise<EnrichedFixture | null> {
	const leagueId = await getTeamLeagueId(tenant, teamSlug);
	if (!leagueId) {
		return null;
	}

	const context = await loadMatchdayContext(tenant, leagueId);
	return context?.matchdayClubId
		? resolveMatchdayNextMatch(context.fixtures, context.matchdayClubId)
		: null;
}

export async function getPreviousMatch(
	tenant: Tenant,
	teamSlug: string
): Promise<EnrichedFixture | null> {
	const leagueId = await getTeamLeagueId(tenant, teamSlug);
	if (!leagueId) {
		return null;
	}

	const context = await loadMatchdayContext(tenant, leagueId);
	return context?.matchdayClubId
		? resolveMatchdayPreviousMatch(context.fixtures, context.matchdayClubId)
		: null;
}
