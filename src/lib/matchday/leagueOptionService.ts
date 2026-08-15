import { getSiteSettings } from '@/lib/content/siteSettings';
import logger from '@/lib/logger';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';
import type { LeagueOption } from '@/types/matchday';

const log = logger.child({ service: 'leagueOptionService' });

type League = {
	id: string;
	name: string;
	competitionId: string;
	seasonId: string;
};

function buildLabel(
	league: League,
	competitionNamesById: Map<string, string>,
	seasonNamesById: Map<string, string>
): string {
	const competitionName = competitionNamesById.get(league.competitionId) ?? league.competitionId;
	const seasonName = seasonNamesById.get(league.seasonId) ?? league.seasonId;
	return `${league.name} — ${competitionName} (${seasonName})`;
}

/**
 * Leagues this site's club plays in, labelled with their competition + season names.
 * Falls back to the raw competition/season id in the label if either lookup fails, rather
 * than dropping the league entirely (docs/plans/2026-08-15-team-league-picker-design-spike.md).
 */
export async function getClubLeagueOptions(): Promise<LeagueOption[]> {
	const siteSettings = await getSiteSettings();
	const clubId = siteSettings?.matchday?.clubId;

	if (!clubId) {
		log.warn('siteSettings.matchday.clubId is not set — cannot resolve league options');
		return [];
	}

	const client = getMatchdayClient();
	const [leaguesResult, competitionsResult, seasonsResult] = await Promise.all([
		client.GET('/leagues', { params: { query: { clubId } } }),
		client.GET('/competitions'),
		client.GET('/seasons')
	]);

	if (leaguesResult.error || !leaguesResult.data) {
		throw new Error('Failed to load leagues from the matchday API');
	}

	if (competitionsResult.error) {
		log.warn({ err: competitionsResult.error }, 'Failed to load competitions, using raw ids');
	}
	if (seasonsResult.error) {
		log.warn({ err: seasonsResult.error }, 'Failed to load seasons, using raw ids');
	}

	const competitionNamesById = new Map(
		(competitionsResult.data ?? []).map((competition) => [competition.id, competition.name])
	);
	const seasonNamesById = new Map(
		(seasonsResult.data ?? []).map((season) => [season.id, season.name])
	);

	return leaguesResult.data
		.map((league) => ({
			leagueId: league.id,
			label: buildLabel(league, competitionNamesById, seasonNamesById)
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
}
