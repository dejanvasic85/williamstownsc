import { promises as fs } from 'fs';
import path from 'path';
import type { Club, EnrichedFixture, Fixture, FixtureData } from '@/types/match';
import clubsData from './clubs.json';
import { parseClubsData, parseFixtureData } from './fixtureSchema';

const clubs = parseClubsData(clubsData);
const fixturesDirectory = path.join(process.cwd(), 'src/lib/matches');
const fixtureSlugAliasValue: Record<string, string> = {
	'senior-mens': 'seniors-mens'
};

export function getClubs(): Club[] {
	return clubs.clubs;
}

export function getClubById(id: number): Club | undefined {
	return clubs.clubs.find((club) => club.id === id);
}

function enrichFixtures(fixtures: Fixture[]): EnrichedFixture[] {
	return fixtures.map((fixture) => {
		const homeTeam = getClubById(fixture.homeTeamId);
		const awayTeam = getClubById(fixture.awayTeamId);

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
		return parseFixtureData(parsedJson);
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
