import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import { transformExternalClub } from '@/lib/clubService';
import { type Club, type Clubs, clubsSchema, externalApiResponseSchema } from '@/types/matches';

const currentDir = dirname(fileURLToPath(import.meta.url));
const EXTERNAL_DATA_PATH = resolve(currentDir, '../../data/external/clubs/clubs.json');
const CLUBS_FILE_PATH = resolve(currentDir, '../../data/clubs/clubs.json');

function loadExternalData() {
	try {
		const fileContent = readFileSync(EXTERNAL_DATA_PATH, 'utf-8');
		const data = JSON.parse(fileContent);
		return externalApiResponseSchema.parse(data);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			throw new Error(
				`External data file not found at ${EXTERNAL_DATA_PATH}\nPlease paste the API response into data/external/clubs/clubs.json`
			);
		}
		throw error;
	}
}

function loadExistingClubs(): Clubs | null {
	try {
		const fileContent = readFileSync(CLUBS_FILE_PATH, 'utf-8');
		const data = JSON.parse(fileContent);
		return clubsSchema.parse(data);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return null;
		}
		throw error;
	}
}

function mergeClubs(
	existingFile: Clubs | null,
	apiClubs: Club[]
): { file: Clubs; newCount: number; updatedCount: number } {
	const existingClubs = existingFile?.clubs || [];
	const clubsMap = new Map<string, Club>();

	// Index existing clubs by externalId
	for (const club of existingClubs) {
		clubsMap.set(club.externalId, club);
	}

	let newCount = 0;
	let updatedCount = 0;

	// Merge API clubs
	for (const apiClub of apiClubs) {
		if (clubsMap.has(apiClub.externalId)) {
			// Update existing club
			clubsMap.set(apiClub.externalId, apiClub);
			updatedCount++;
		} else {
			// New club
			clubsMap.set(apiClub.externalId, apiClub);
			newCount++;
		}
	}

	// Convert map to array sorted by name
	const mergedClubs = Array.from(clubsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

	const file: Clubs = {
		clubs: mergedClubs
	};

	return { file, newCount, updatedCount };
}

function saveClubsFile(clubsFile: Clubs) {
	const content = JSON.stringify(clubsFile, null, '\t');
	writeFileSync(CLUBS_FILE_PATH, content + '\n', 'utf-8');
}

export async function syncClubs() {
	try {
		console.log('Reading external data from:', EXTERNAL_DATA_PATH);

		// Load and validate external data
		const externalResponse = loadExternalData();
		console.log(`✓ Loaded ${externalResponse.data.length} clubs from external data`);

		// Transform external clubs to our format
		const apiClubs = externalResponse.data.map((externalClub) =>
			transformExternalClub(externalClub)
		);

		// Load existing clubs
		const existingFile = loadExistingClubs();
		console.log(
			existingFile
				? `✓ Loaded ${existingFile.clubs.length} existing clubs`
				: '✓ No existing clubs file found'
		);

		// Merge clubs
		const { file, newCount, updatedCount } = mergeClubs(existingFile, apiClubs);

		// Save to file
		saveClubsFile(file);

		const totalClubs = file.clubs.length;
		console.log(`\n✅ Successfully synced ${totalClubs} clubs!`);
		console.log(`   - ${newCount} new clubs added`);
		console.log(`   - ${updatedCount} clubs updated`);
		console.log(`   - ${totalClubs - newCount - updatedCount} clubs preserved`);
		console.log(`\nSaved to: ${CLUBS_FILE_PATH}`);
	} catch (error) {
		if (error instanceof ZodError) {
			console.error('\n❌ Validation Error:');
			console.error(error.issues);
			process.exit(1);
		}

		if (error instanceof Error) {
			console.error(`\n❌ Error: ${error.message}`);
			process.exit(1);
		}

		console.error('\n❌ Unknown error occurred');
		console.error(error);
		process.exit(1);
	}
}
