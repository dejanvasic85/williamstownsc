import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';
import * as Sentry from '@sentry/nextjs';
import { getTeamLeagueId } from '@/lib/content/teamDetail';
import logger from '@/lib/logger';
import { getMatchdayTableForLeague } from '@/lib/matchday/matchdayTableService';
import { tableDataSchema } from '@/types/table';
import type { TableData } from '@/types/table';

const log = logger.child({ service: 'tableService' });
const tableDirectory = path.join(process.cwd(), 'data', 'table');

const loadTable = cache(async function loadTable(slug: string): Promise<TableData | null> {
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return null;
	}

	const filePath = path.resolve(tableDirectory, `${slug}.json`);
	const relativePath = path.relative(tableDirectory, filePath);
	if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
		return null;
	}

	try {
		const fileContents = await fs.readFile(filePath, 'utf-8');
		return tableDataSchema.parse(JSON.parse(fileContents));
	} catch {
		return null;
	}
});

export async function getTableForTeam(slug: string): Promise<TableData | null> {
	const leagueId = await getTeamLeagueId(slug);
	if (leagueId) {
		try {
			return await getMatchdayTableForLeague(leagueId);
		} catch (error) {
			Sentry.captureException(error);
			log.error({ err: error, leagueId }, 'failed to load matchday table');
			return null;
		}
	}

	return loadTable(slug);
}
