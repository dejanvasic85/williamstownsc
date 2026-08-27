import { getClubLeagues } from '@dejanvasic85/matchday-sdk';
import { getMatchdayClubId } from '@/lib/content/siteSettings';
import logger from '@/lib/logger';
import { getMatchdayClient } from '@/lib/matchday/matchdayClient';
import type { LeagueOption } from '@/types/matchday';

const log = logger.child({ service: 'leagueOptionService' });

/** Leagues this site's club plays in, labelled with competition and season. Includes divisions
 * that never publish a ladder, e.g. MiniRoos age groups. */
export async function getClubLeagueOptions(): Promise<LeagueOption[]> {
	const clubId = await getMatchdayClubId();

	if (!clubId) {
		log.warn('siteSettings.matchday.clubId is not set — cannot resolve league options');
		return [];
	}

	const result = await getClubLeagues(getMatchdayClient(), clubId);

	if (!result.ok) {
		throw new Error(`Failed to load leagues from the matchday API: ${result.error.message}`);
	}

	return result.value
		.map((league) => ({
			leagueId: league.id,
			label: `${league.name} — ${league.competition.name} (${league.season.name})`
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
}
