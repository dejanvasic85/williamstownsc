import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';
import { TZDate } from '@date-fns/tz';
import { addMinutes, isBefore } from 'date-fns';
import {
	getClubByExternalId as getClubByExternalIdFromService,
	getClubs as getClubsFromService,
	resolveTeamDisplayName
} from '@/lib/clubService';
import { getClubConfig } from '@/lib/config';
import { bye, fixtureDataSchema } from '@/types/matches';
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

function isByeFixture(fixture: Fixture): boolean {
	return fixture.homeTeamId === bye || fixture.awayTeamId === bye;
}

function findDuplicateClubIds(fixtures: Fixture[]): Set<string> {
	const clubTeamNames = new Map<string, Set<string>>();

	for (const fixture of fixtures) {
		if (isByeFixture(fixture)) continue;

		const sides: Array<[string, string | undefined]> = [
			[fixture.homeTeamId, fixture.homeTeamName],
			[fixture.awayTeamId, fixture.awayTeamName]
		];

		for (const [clubId, teamName] of sides) {
			if (!clubTeamNames.has(clubId)) clubTeamNames.set(clubId, new Set());
			if (teamName) clubTeamNames.get(clubId)!.add(teamName);
		}
	}

	const duplicates = new Set<string>();
	for (const [clubId, names] of clubTeamNames) {
		if (names.size > 1) duplicates.add(clubId);
	}
	return duplicates;
}

function enrichFixture(fixture: Fixture, duplicateClubIds: Set<string>): EnrichedFixture {
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
		homeTeamDisplayName: resolveTeamDisplayName(
			fixture.homeTeamName,
			homeTeam,
			duplicateClubIds.has(fixture.homeTeamId)
		),
		awayTeamDisplayName: resolveTeamDisplayName(
			fixture.awayTeamName,
			awayTeam,
			duplicateClubIds.has(fixture.awayTeamId)
		),
		address: fixture.address,
		coordinates: fixture.coordinates,
		homeScore: fixture.homeScore,
		awayScore: fixture.awayScore,
		homeScoreHalf: fixture.homeScoreHalf,
		awayScoreHalf: fixture.awayScoreHalf,
		status: fixture.status
	};
}

function enrichFixtures(fixtures: Fixture[]): EnrichedFixture[] {
	const duplicateClubIds = findDuplicateClubIds(fixtures);
	return fixtures
		.filter((f) => !isByeFixture(f))
		.map((fixture) => enrichFixture(fixture, duplicateClubIds));
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

const matchDurationMinutes = 120;

function resolveNextMatch(fixtures: Fixture[], wscClubDriblId: string): EnrichedFixture | null {
	const now = new Date();
	const duplicateClubIds = findDuplicateClubIds(fixtures);

	const upcoming = fixtures
		.filter((f) => !isByeFixture(f))
		.map((fixture) => ({
			fixture,
			matchDateTime: parseFixtureDateTime(fixture.date, fixture.time)
		}))
		.filter(({ fixture, matchDateTime }) => {
			const isClubMatch =
				fixture.homeTeamId === wscClubDriblId || fixture.awayTeamId === wscClubDriblId;
			const matchEnd = addMinutes(matchDateTime, matchDurationMinutes);
			return isClubMatch && isBefore(now, matchEnd);
		});

	if (upcoming.length === 0) return null;

	upcoming.sort((a, b) => a.matchDateTime.getTime() - b.matchDateTime.getTime());
	return enrichFixture(upcoming[0].fixture, duplicateClubIds);
}

function resolvePreviousMatch(fixtures: Fixture[], wscClubDriblId: string): EnrichedFixture | null {
	const now = new Date();
	const duplicateClubIds = findDuplicateClubIds(fixtures);

	const completed = fixtures
		.filter((f) => !isByeFixture(f))
		.map((fixture) => ({
			fixture,
			matchDateTime: parseFixtureDateTime(fixture.date, fixture.time)
		}))
		.filter(({ fixture, matchDateTime }) => {
			if (fixture.status !== 'complete') return false;
			const isClubMatch =
				fixture.homeTeamId === wscClubDriblId || fixture.awayTeamId === wscClubDriblId;
			return isClubMatch && isBefore(matchDateTime, now);
		});

	if (completed.length === 0) return null;

	completed.sort((a, b) => b.matchDateTime.getTime() - a.matchDateTime.getTime());
	return enrichFixture(completed[0].fixture, duplicateClubIds);
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

	const { wscClubDriblId } = getClubConfig();
	const { fixtures } = fixtureData;

	return {
		hasFixtures: true,
		nextMatch: resolveNextMatch(fixtures, wscClubDriblId),
		previousMatch: resolvePreviousMatch(fixtures, wscClubDriblId)
	};
}

export async function getNextMatch(teamSlug: string): Promise<EnrichedFixture | null> {
	const fixtureData = await loadFixture(teamSlug);
	if (!fixtureData) return null;
	const { wscClubDriblId } = getClubConfig();
	return resolveNextMatch(fixtureData.fixtures, wscClubDriblId);
}

export async function getPreviousMatch(teamSlug: string): Promise<EnrichedFixture | null> {
	const fixtureData = await loadFixture(teamSlug);
	if (!fixtureData) return null;
	const { wscClubDriblId } = getClubConfig();
	return resolvePreviousMatch(fixtureData.fixtures, wscClubDriblId);
}
