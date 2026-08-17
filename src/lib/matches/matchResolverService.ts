import { addMinutes, isBefore } from 'date-fns';
import { parseFixtureDateTime } from '@/lib/matches/fixtureDateTimeService';
import type { EnrichedFixture } from '@/types/matches';

const matchDurationMinutes = 120;

function isClubFixture(fixture: EnrichedFixture, clubId: string): boolean {
	return fixture.homeTeam.externalId === clubId || fixture.awayTeam.externalId === clubId;
}

/** Pure — no fetching. Finds the soonest fixture for `clubId` that hasn't finished yet (kickoff
 * plus a nominal match duration), from an already-fetched, already-enriched fixture list. */
export function resolveMatchdayNextMatch(
	fixtures: EnrichedFixture[],
	clubId: string
): EnrichedFixture | null {
	const now = new Date();
	const upcoming = fixtures
		.filter((fixture) => isClubFixture(fixture, clubId))
		.map((fixture) => ({
			fixture,
			matchDateTime: parseFixtureDateTime(fixture.date, fixture.time)
		}))
		.filter(({ matchDateTime }) => isBefore(now, addMinutes(matchDateTime, matchDurationMinutes)));

	if (upcoming.length === 0) {
		return null;
	}

	upcoming.sort((a, b) => a.matchDateTime.getTime() - b.matchDateTime.getTime());
	return upcoming[0].fixture;
}

/** Pure — no fetching. Finds the most recent completed fixture for `clubId`, from an
 * already-fetched, already-enriched fixture list. */
export function resolveMatchdayPreviousMatch(
	fixtures: EnrichedFixture[],
	clubId: string
): EnrichedFixture | null {
	const now = new Date();
	const completed = fixtures
		.filter((fixture) => fixture.status === 'complete' && isClubFixture(fixture, clubId))
		.map((fixture) => ({
			fixture,
			matchDateTime: parseFixtureDateTime(fixture.date, fixture.time)
		}))
		.filter(({ matchDateTime }) => isBefore(matchDateTime, now));

	if (completed.length === 0) {
		return null;
	}

	completed.sort((a, b) => b.matchDateTime.getTime() - a.matchDateTime.getTime());
	return completed[0].fixture;
}
