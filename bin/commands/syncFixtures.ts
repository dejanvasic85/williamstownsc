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
const EXTERNAL_DIR = path.resolve(currentDir, '../../data/external/fixtures');
const OUTPUT_DIR = path.resolve(currentDir, '../../data/matches');

type SyncFixturesOptions = {
	team: string;
};

// Read all external fixture files for a team
async function readExternalFixtureFiles(team: string): Promise<ExternalFixturesApiResponse[]> {
	const teamDir = path.join(EXTERNAL_DIR, team);

	try {
		const files = await fs.readdir(teamDir);
		const externalFiles = files
			.filter((f) => f.match(/^chunk-\d+\.json$/))
			.sort((a, b) => {
				const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
				const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
				return numA - numB;
			});

		if (externalFiles.length === 0) {
			throw new Error(
				`No external fixture files found in ${teamDir}\n` +
					`Expected files matching pattern: chunk-*.json`
			);
		}

		log.info({ count: externalFiles.length, files: externalFiles }, 'found external fixture files');

		const responses: ExternalFixturesApiResponse[] = [];

		for (const file of externalFiles) {
			const filePath = path.join(teamDir, file);
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
			throw new Error(
				`Team directory not found: ${teamDir}\n` +
					`Please create it and add fixture files: mkdir -p ${teamDir}`
			);
		}
		throw error;
	}
}

// Transform and merge all fixtures
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

				// Extract metadata from first fixture
				if (!competition) {
					competition = externalFixture.attributes.competition_name;
				}
				if (!season) {
					// Extract year from date
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

// Deduplicate fixtures
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

// Sort fixtures by round, then date
function sortFixtures(fixtures: Fixture[]): Fixture[] {
	return fixtures.sort((a, b) => {
		if (a.round !== b.round) {
			return a.round - b.round;
		}
		return a.date.localeCompare(b.date);
	});
}

// Calculate total rounds
function calculateTotalRounds(fixtures: Fixture[]): number {
	const rounds = fixtures.map((f) => f.round);
	return Math.max(...rounds, 0);
}

// Write fixture data to file
async function writeFixtureData(team: string, data: FixtureData): Promise<void> {
	const outputPath = path.join(OUTPUT_DIR, `${team}.json`);

	// Validate before writing
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
		// Read and validate all external files
		const responses = await readExternalFixtureFiles(team);

		// Transform and merge
		log.info('transforming and merging fixtures');
		const { fixtures: rawFixtures, competition, season } = mergeFixtures(responses);
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

		process.exit(1);
	}
}
