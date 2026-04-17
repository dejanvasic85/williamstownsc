import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';
import { TZDate } from '@date-fns/tz';
import { isBefore } from 'date-fns';
import {
	getClubByExternalId as getClubByExternalIdFromService,
	getClubs as getClubsFromService
} from '@/lib/clubService';
import { getClubConfig } from '@/lib/config';
import { fixtureDataSchema } from '@/types/matches';
import type { Club, EnrichedFixture, Fixture, FixtureData } from '@/types/matches';

const fixturesDirectory = path.join(process.cwd(), 'data', 'matches');
const melbourneTimezone = 'Australia/Melbourne';

function parseFixtureDateTime(date: string, time: string): TZDate {
	const [year, month, day] = date.split('-').map(Number);
	const [hour, minute] = time.split(':').map(Number);
	return new TZDate(year, month - 1, day, hour, minute, melbourneTimezone);
}

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
			coordinates: fixture.coordinates,
			homeScore: fixture.homeScore,
			awayScore: fixture.awayScore,
			homeScoreHalf: fixture.homeScoreHalf,
			awayScoreHalf: fixture.awayScoreHalf,
			status: fixture.status
		};
	});
}

const loadFixture = cache(async function loadFixture(
	leageName: string
): Promise<FixtureData | null> {
	const filePath = path.join(fixturesDirectory, `${leageName}.json`);

	try {
		const fileContents = await fs.readFile(filePath, 'utf-8');
		const parsedJson = JSON.parse(fileContents);
		return fixtureDataSchema.parse(parsedJson);
	} catch {
		return null;
	}
});

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

function resolveNextMatch(fixtures: Fixture[], wscClubExternalId: string): EnrichedFixture | null {
	const now = new Date();

	const upcoming = fixtures
		.map((fixture) => ({
			fixture,
			matchDateTime: parseFixtureDateTime(fixture.date, fixture.time)
		}))
		.filter(({ fixture, matchDateTime }) => {
			const isClubMatch =
				fixture.homeTeamId === wscClubExternalId || fixture.awayTeamId === wscClubExternalId;
			return isClubMatch && isBefore(now, matchDateTime);
		});

	if (upcoming.length === 0) return null;

	upcoming.sort((a, b) => a.matchDateTime.getTime() - b.matchDateTime.getTime());
	return enrichFixtures([upcoming[0].fixture])[0];
}

function resolvePreviousMatch(
	fixtures: Fixture[],
	wscClubExternalId: string
): EnrichedFixture | null {
	const now = new Date();

	const completed = fixtures
		.map((fixture) => ({
			fixture,
			matchDateTime: parseFixtureDateTime(fixture.date, fixture.time)
		}))
		.filter(({ fixture, matchDateTime }) => {
			if (fixture.status !== 'complete') return false;
			const isClubMatch =
				fixture.homeTeamId === wscClubExternalId || fixture.awayTeamId === wscClubExternalId;
			return isClubMatch && isBefore(matchDateTime, now);
		});

	if (completed.length === 0) return null;

	completed.sort((a, b) => b.matchDateTime.getTime() - a.matchDateTime.getTime());
	return enrichFixtures([completed[0].fixture])[0];
}

export async function getTeamMatches(teamSlug: string): Promise<{
	hasFixtures: boolean;
	nextMatch: EnrichedFixture | null;
	previousMatch: EnrichedFixture | null;
}> {
	const fixtureData = await loadFixture(teamSlug);

	if (!fixtureData?.fixtures.length) {
		return { hasFixtures: false, nextMatch: null, previousMatch: null };
	}

	const { wscClubExternalId } = getClubConfig();
	const { fixtures } = fixtureData;

	return {
		hasFixtures: true,
		nextMatch: resolveNextMatch(fixtures, wscClubExternalId),
		previousMatch: resolvePreviousMatch(fixtures, wscClubExternalId)
	};
}

export async function getNextMatch(teamSlug: string): Promise<EnrichedFixture | null> {
	const fixtureData = await loadFixture(teamSlug);
	if (!fixtureData) return null;
	const { wscClubExternalId } = getClubConfig();
	return resolveNextMatch(fixtureData.fixtures, wscClubExternalId);
}

export async function getPreviousMatch(teamSlug: string): Promise<EnrichedFixture | null> {
	const fixtureData = await loadFixture(teamSlug);
	if (!fixtureData) return null;
	const { wscClubExternalId } = getClubConfig();
	return resolvePreviousMatch(fixtureData.fixtures, wscClubExternalId);
}
