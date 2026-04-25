import { promises as fs } from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import logger from '@/lib/logger';
import { transformExternalFixture } from '@/lib/matches/fixtureTransformService';
import {
	type ExternalFixturesApiResponse,
	externalFixturesApiResponseSchema,
	fixtureDataSchema
} from '@/types/matches';
import type { Fixture, FixtureData } from '@/types/matches';

const log = logger.child({ module: 'sync-fixtures' });

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const EXTERNAL_FIXTURES_DIR = path.resolve(currentDir, '../../data/external/fixtures');
const EXTERNAL_RESULTS_DIR = path.resolve(currentDir, '../../data/external/results');
const OUTPUT_DIR = path.resolve(currentDir, '../../data/matches');

type SyncFixturesOptions = {
	team: string;
};

async function readExternalFixtureFiles(
	dir: string,
	required: boolean
): Promise<ExternalFixturesApiResponse[]> {
	try {
		const files = await fs.readdir(dir);
		const externalFiles = files
			.filter((f) => f.match(/^chunk-\d+\.json$/))
			.sort((a, b) => {
				const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
				const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
				return numA - numB;
			});

		if (externalFiles.length === 0) {
			if (!required) {
				log.info({ dir }, 'no files found, skipping optional directory');
				return [];
			}
			throw new Error(
				`No external fixture files found in ${dir}\n` +
					`Expected files matching pattern: chunk-*.json`
			);
		}

		log.info({ count: externalFiles.length, files: externalFiles }, 'found external fixture files');

		const responses: ExternalFixturesApiResponse[] = [];

		for (const file of externalFiles) {
			const filePath = path.join(dir, file);
			const content = await fs.readFile(filePath, 'utf-8');

			try {
				const json = JSON.parse(content);
				const validated = externalFixturesApiResponseSchema.parse(json);
				responses.push(validated);
				log.info({ file, fixtures: validated.data.length }, 'validated fixture file');
			} catch (error) {
				if (error instanceof ZodError) {
					log.error({ file, issues: error.issues }, 'validation error in fixture file');
					throw error;
				}
				throw new Error(`Failed to parse ${file}: ${error}`);
			}
		}

		return responses;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			if (!required) {
				log.info({ dir }, 'directory not found, skipping optional directory');
				return [];
			}
			throw new Error(
				`Team directory not found: ${dir}\n` +
					`Please create it and add fixture files: mkdir -p ${dir}`
			);
		}
		throw error;
	}
}

function mergeFixtures(responses: ExternalFixturesApiResponse[]): {
	fixtures: Fixture[];
	competition: string;
	season: number;
} {
	const allFixtures: Fixture[] = [];
	let competition = '';
	let season = 0;

	for (const response of responses) {
		for (const externalFixture of response.data) {
			try {
				const fixture = transformExternalFixture(externalFixture);
				allFixtures.push(fixture);

				if (!competition) {
					competition = externalFixture.attributes.competition_name;
				}
				if (!season) {
					const year = new Date(externalFixture.attributes.date).getFullYear();
					season = year;
				}
			} catch (error) {
				log.warn({ fixture: externalFixture.attributes.name, err: error }, 'skipping fixture');
			}
		}
	}

	return { fixtures: allFixtures, competition, season };
}

function deduplicateFixtures(fixtures: Fixture[]): Fixture[] {
	const seen = new Set<string>();
	const deduplicated: Fixture[] = [];

	for (const fixture of fixtures) {
		const key = `${fixture.round}-${fixture.homeTeamId}-${fixture.awayTeamId}`;

		if (!seen.has(key)) {
			seen.add(key);
			deduplicated.push(fixture);
		}
	}

	const duplicateCount = fixtures.length - deduplicated.length;
	if (duplicateCount > 0) {
		log.info({ duplicateCount }, 'removed duplicate fixtures');
	}

	return deduplicated;
}

function sortFixtures(fixtures: Fixture[]): Fixture[] {
	return fixtures.sort((a, b) => {
		if (a.round !== b.round) {
			return a.round - b.round;
		}
		return a.date.localeCompare(b.date);
	});
}

function calculateTotalRounds(fixtures: Fixture[]): number {
	const rounds = fixtures.map((f) => f.round);
	return Math.max(...rounds, 0);
}

async function writeFixtureData(team: string, data: FixtureData): Promise<void> {
	const outputPath = path.join(OUTPUT_DIR, `${team}.json`);

	fixtureDataSchema.parse(data);

	await fs.writeFile(outputPath, JSON.stringify(data, null, '\t'), 'utf-8');

	log.info(
		{
			outputPath,
			competition: data.competition,
			season: data.season,
			totalFixtures: data.totalFixtures,
			totalRounds: data.totalRounds
		},
		'fixture data written'
	);
}

export async function syncFixtures({ team }: SyncFixturesOptions) {
	log.info({ team }, 'starting fixture sync');

	try {
		// Read results first (they win deduplication)
		const resultResponses = await readExternalFixtureFiles(
			path.join(EXTERNAL_RESULTS_DIR, team),
			false
		);
		const fixtureResponses = await readExternalFixtureFiles(
			path.join(EXTERNAL_FIXTURES_DIR, team),
			false
		);

		if (resultResponses.length === 0 && fixtureResponses.length === 0) {
			log.warn({ team }, 'no fixture or result files found, skipping');
			return;
		}

		// Transform and merge — results first so they win deduplication
		log.info('transforming and merging fixtures');
		const {
			fixtures: rawFixtures,
			competition,
			season
		} = mergeFixtures([...resultResponses, ...fixtureResponses]);
		log.info({ rawCount: rawFixtures.length }, 'raw fixtures merged');

		// Deduplicate
		const uniqueFixtures = deduplicateFixtures(rawFixtures);
		log.info({ uniqueCount: uniqueFixtures.length }, 'fixtures deduplicated');

		// Sort
		const sortedFixtures = sortFixtures(uniqueFixtures);

		// Calculate metadata
		const totalRounds = calculateTotalRounds(sortedFixtures);

		// Build output
		const fixtureData: FixtureData = {
			competition,
			season,
			totalFixtures: sortedFixtures.length,
			totalRounds,
			fixtures: sortedFixtures
		};

		// Write to file
		await writeFixtureData(team, fixtureData);

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
