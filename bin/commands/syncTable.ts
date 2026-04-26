import { promises as fs } from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import logger from '@/lib/logger';
import { externalTableApiResponseSchema, tableDataSchema } from '@/types/table';
import type { TableData, TableEntry } from '@/types/table';

const log = logger.child({ module: 'sync-table' });

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const externalTableDir = path.resolve(currentDir, '../../data/external/table');
const outputDir = path.resolve(currentDir, '../../data/table');

type SyncTableOptions = {
	team: string;
};

function transformEntry(raw: {
	attributes: {
		team_hash_id: string;
		team_name: string;
		club_name: string;
		club_logo: string;
		position: number;
		played: number;
		won: number;
		drawn: number;
		lost: number;
		goals_for: number;
		goals_against: number;
		goal_difference: number;
		points: number;
	};
}): TableEntry {
	const a = raw.attributes;
	return {
		teamId: a.team_hash_id,
		teamName: a.team_name,
		clubName: a.club_name,
		logoUrl: a.club_logo,
		position: a.position,
		played: a.played,
		wins: a.won,
		draws: a.drawn,
		losses: a.lost,
		goalsFor: a.goals_for,
		goalsAgainst: a.goals_against,
		goalDifference: a.goal_difference,
		points: a.points
	};
}

export async function syncTable({ team }: SyncTableOptions) {
	log.info({ team }, 'starting table sync');

	try {
		const inputPath = path.join(externalTableDir, `${team}.json`);

		try {
			await fs.access(inputPath);
		} catch {
			log.warn({ team }, 'no external table data found, skipping');
			return;
		}

		const content = await fs.readFile(inputPath, 'utf-8');
		const external = externalTableApiResponseSchema.parse(JSON.parse(content));

		log.info({ entries: external.data.length }, 'external data loaded and validated');

		if (external.data.length === 0) {
			log.warn({ team }, 'no table entries found, skipping');
			return;
		}

		const firstEntry = external.data[0];
		const rawSeason = parseInt(firstEntry.attributes.season_name.trim(), 10);
		const season = Number.isInteger(rawSeason) ? rawSeason : new Date().getFullYear();
		if (!Number.isInteger(rawSeason)) {
			log.warn(
				{ seasonName: firstEntry.attributes.season_name, fallback: season },
				'unexpected season_name, falling back to current year'
			);
		}
		const competition = firstEntry.attributes.league_name;

		const entries: TableEntry[] = external.data
			.slice()
			.sort((a, b) => a.attributes.position - b.attributes.position)
			.map(transformEntry);

		const tableData: TableData = { season, competition, entries };
		tableDataSchema.parse(tableData);

		await fs.mkdir(outputDir, { recursive: true });
		const outputPath = path.join(outputDir, `${team}.json`);
		await fs.writeFile(outputPath, JSON.stringify(tableData, null, '\t') + '\n', 'utf-8');

		log.info({ outputPath, season, competition, entries: entries.length }, 'table data written');
		log.info('sync completed');
	} catch (error) {
		if (error instanceof ZodError) {
			log.error({ issues: error.issues }, 'sync failed: validation error');
		} else if (error instanceof Error) {
			log.error({ err: error }, 'sync failed');
		} else {
			log.error({ err: error }, 'sync failed: unknown error');
		}

		throw error;
	}
}
