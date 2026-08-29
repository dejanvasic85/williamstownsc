import * as Sentry from '@sentry/nextjs';
import { getTeamLeagueId } from '@/lib/content/teamDetail';
import logger from '@/lib/logger';
import { getMatchdayTableForLeague } from '@/lib/matchday/matchdayTableService';
import type { TableData } from '@/types/table';

const log = logger.child({ service: 'tableService' });

export async function getTableForTeam(slug: string): Promise<TableData | null> {
	const leagueId = await getTeamLeagueId(slug);
	if (!leagueId) {
		return null;
	}

	try {
		return await getMatchdayTableForLeague(leagueId);
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error, leagueId }, 'failed to load matchday table');
		return null;
	}
}
