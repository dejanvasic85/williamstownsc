import { promises as fs } from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import { transformExternalFixture } from '@/lib/matches/fixtureTransformService';
import {
	type ExternalFixturesApiResponse,
	externalFixturesApiResponseSchema,
	fixtureDataSchema
} from '@/types/matches';
import type { Fixture, FixtureData } from '@/types/matches';

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

		console.log(`\n📂 Found ${externalFiles.length} external fixture file(s):`);
		externalFiles.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));

		const responses: ExternalFixturesApiResponse[] = [];

		for (const file of externalFiles) {
			const filePath = path.join(teamDir, file);
			const content = await fs.readFile(filePath, 'utf-8');

			try {
				const json = JSON.parse(content);
				const validated = externalFixturesApiResponseSchema.parse(json);
				responses.push(validated);
				console.log(`   ✓ ${file} - ${validated.data.length} fixtures`);
			} catch (error) {
				if (error instanceof ZodError) {
					console.error(`\n❌ Validation Error in ${file}:`);
					console.error(error.issues);
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
				console.warn(
					`⚠️  Skipping fixture ${externalFixture.attributes.name}: ${(error as Error).message}`
				);
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
		console.log(`\n🔄 Removed ${duplicateCount} duplicate fixture(s)`);
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

	console.log(`\n✅ Fixture data written to: ${outputPath}`);
	console.log(`   Competition: ${data.competition}`);
	console.log(`   Season: ${data.season}`);
	console.log(`   Total Fixtures: ${data.totalFixtures}`);
	console.log(`   Total Rounds: ${data.totalRounds}`);
}

export async function syncFixtures({ team }: SyncFixturesOptions) {
	console.log('🏟️  Fixture Sync Tool\n');

	console.log(`📋 Syncing fixtures for team: ${team}`);

	try {
		// Read and validate all external files
		const responses = await readExternalFixtureFiles(team);

		// Transform and merge
		console.log(`\n🔄 Transforming and merging fixtures...`);
		const { fixtures: rawFixtures, competition, season } = mergeFixtures(responses);
		console.log(`   Raw fixtures: ${rawFixtures.length}`);

		// Deduplicate
		const uniqueFixtures = deduplicateFixtures(rawFixtures);
		console.log(`   Unique fixtures: ${uniqueFixtures.length}`);

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

		console.log('\n✨ Sync completed successfully!\n');
	} catch (error) {
		console.error('\n❌ Sync failed:');

		if (error instanceof ZodError) {
			console.error('\nValidation Error:');
			console.error(error.issues);
		} else if (error instanceof Error) {
			console.error(error.message);
		} else {
			console.error(error);
		}

		console.log('');
		process.exit(1);
	}
}
