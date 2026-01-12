import { promises as fs } from 'fs';
import path from 'path';
import clubsData from '@data/clubs/clubs.json';
import { clubsSchema } from '@/lib/schemas/clubSchema';
import type { Club as ClubSchema } from '@/lib/schemas/clubSchema';
import { fixtureDataSchema } from '@/lib/schemas/fixtureSchema';
import type { Club, EnrichedFixture, Fixture, FixtureData } from '@/types/match';

const clubs = clubsSchema.parse(clubsData);
const fixturesDirectory = path.join(process.cwd(), 'data/matches');
const fixtureSlugAliasValue: Record<string, string> = {
	'senior-mens': 'seniors-mens'
};

export function getClubs(): Club[] {
	return clubs.clubs;
}

export function getClubByExternalId(externalId: string): Club | undefined {
	return clubs.clubs.find((club: ClubSchema) => club.externalId === externalId);
}

function enrichFixtures(fixtures: Fixture[]): EnrichedFixture[] {
	return fixtures.map((fixture) => {
		const homeTeam = getClubByExternalId(fixture.homeTeamId);
		const awayTeam = getClubByExternalId(fixture.awayTeamId);

		if (!homeTeam || !awayTeam) {
			throw new Error(`Club not found for fixture round ${fixture.round}`);
		}

		return {
			round: fixture.round,
			date: fixture.date,
			day: fixture.day,
			time: fixture.time,
			homeTeam,
			awayTeam,
			address: fixture.address,
			coordinates: fixture.coordinates
		};
	});
}

async function loadFixtureDataBySlug(slug: string): Promise<FixtureData | null> {
	const normalizedSlug = fixtureSlugAliasValue[slug] ?? slug;
	const filePath = path.join(fixturesDirectory, `${normalizedSlug}.json`);

	try {
		const fileContents = await fs.readFile(filePath, 'utf-8');
		const parsedJson = JSON.parse(fileContents);
		return fixtureDataSchema.parse(parsedJson);
	} catch (error) {
		if (process.env.NODE_ENV !== 'production') {
			console.warn(`No fixture data found for slug: ${normalizedSlug}`, error);
		}
		return null;
	}
}

export async function getFixturesForTeam(slug: string): Promise<{
	fixtures: EnrichedFixture[];
	competition: string;
	season: number;
} | null> {
	const fixtureData = await loadFixtureDataBySlug(slug);

	if (!fixtureData) {
		return null;
	}

	return {
		fixtures: enrichFixtures(fixtureData.fixtures),
		competition: fixtureData.competition,
		season: fixtureData.season
	};
}

export async function hasFixtures(slug: string): Promise<boolean> {
	const fixtureData = await loadFixtureDataBySlug(slug);
	return Boolean(fixtureData?.fixtures.length);
}
