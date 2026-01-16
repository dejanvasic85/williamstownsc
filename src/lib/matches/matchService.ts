import { promises as fs } from 'fs';
import path from 'path';
import { isBefore, parseISO } from 'date-fns';
import {
	getClubByExternalId as getClubByExternalIdFromService,
	getClubs as getClubsFromService
} from '@/lib/clubService';
import { fixtureDataSchema } from '@/types/matches';
import type { Club, EnrichedFixture, Fixture, FixtureData } from '@/types/matches';

const fixturesDirectory = path.join(process.cwd(), 'data', 'matches');

export function getClubs(): Club[] {
	return getClubsFromService();
}

export function getClubByExternalId(externalId: string): Club | undefined {
	return getClubByExternalIdFromService(externalId);
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

async function loadFixture(leageName: string): Promise<FixtureData | null> {
	const filePath = path.join(fixturesDirectory, `${leageName}.json`);

	try {
		const fileContents = await fs.readFile(filePath, 'utf-8');
		const parsedJson = JSON.parse(fileContents);
		return fixtureDataSchema.parse(parsedJson);
	} catch {
		return null;
	}
}

export async function getFixturesForTeam(slug: string): Promise<{
	fixtures: EnrichedFixture[];
	competition: string;
	season: number;
} | null> {
	const fixtureData = await loadFixture(slug);

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
	const fixtureData = await loadFixture(slug);
	return Boolean(fixtureData?.fixtures.length);
}

export async function getNextMatch(teamSlug: string): Promise<EnrichedFixture | null> {
	const fixtureData = await loadFixture(teamSlug);

	if (!fixtureData) {
		return null;
	}

	const williamstownExternalId = '6lNbpDpwdx';
	const now = new Date();

	const upcomingFixtures = fixtureData.fixtures.filter((fixture) => {
		const isWilliamstownMatch =
			fixture.homeTeamId === williamstownExternalId ||
			fixture.awayTeamId === williamstownExternalId;

		if (!isWilliamstownMatch) {
			return false;
		}

		const matchDateTime = parseISO(`${fixture.date}T${fixture.time}`);
		return isBefore(now, matchDateTime);
	});

	if (upcomingFixtures.length === 0) {
		return null;
	}

	upcomingFixtures.sort((a, b) => {
		const dateTimeA = parseISO(`${a.date}T${a.time}`);
		const dateTimeB = parseISO(`${b.date}T${b.time}`);
		return dateTimeA.getTime() - dateTimeB.getTime();
	});

	const nextFixture = upcomingFixtures[0];
	const enriched = enrichFixtures([nextFixture]);
	return enriched[0];
}
