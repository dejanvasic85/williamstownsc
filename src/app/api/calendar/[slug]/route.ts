import { TZDate } from '@date-fns/tz';
import { addHours } from 'date-fns';
import { getFixturesForTeam } from '@/lib/matches/matchService';
import type { EnrichedFixture } from '@/types/matches';

const melbourneTimezone = 'Australia/Melbourne';
const matchDurationHours = 2;

type RouteParams = {
	params: Promise<{ slug: string }>;
};

function buildVEvent(fixture: EnrichedFixture, slug: string): string {
	const [year, month, day] = fixture.date.split('-').map(Number);
	const [hour, minute] = fixture.time.split(':').map(Number);
	const startTz = new TZDate(year, month - 1, day, hour, minute, melbourneTimezone);
	const startUtc = new Date(startTz.getTime());
	const endUtc = addHours(startUtc, matchDurationHours);

	const format = (d: Date) =>
		d
			.toISOString()
			.replace(/[-:]/g, '')
			.replace(/\.\d{3}Z$/, 'Z');

	const uid = `r${fixture.round}-${fixture.homeTeam.externalId}-${fixture.awayTeam.externalId}-${slug}@williamstownsc.com.au`;
	const summary = `${fixture.homeTeamDisplayName} vs ${fixture.awayTeamDisplayName} - Round ${fixture.round}`;
	const mapsUrl = fixture.coordinates ? `https://maps.google.com/?q=${fixture.coordinates}` : '';
	const description = [fixture.address, mapsUrl].filter(Boolean).join('\\n');
	const status = fixture.status === 'complete' ? 'CONFIRMED' : 'TENTATIVE';

	return [
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTART:${format(startUtc)}`,
		`DTEND:${format(endUtc)}`,
		`SUMMARY:${summary}`,
		`LOCATION:${fixture.address}`,
		`DESCRIPTION:${description}`,
		`STATUS:${status}`,
		'END:VEVENT'
	].join('\r\n');
}

function buildIcal(
	fixtures: EnrichedFixture[],
	competition: string,
	season: number,
	slug: string
): string {
	const events = fixtures.map((f) => buildVEvent(f, slug)).join('\r\n');
	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Williamstown SC//Fixtures//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:${competition} ${season}`,
		'X-WR-TIMEZONE:Australia/Melbourne',
		events,
		'END:VCALENDAR'
	].join('\r\n');
}

export async function GET(_request: Request, { params }: RouteParams) {
	const { slug } = await params;
	const fixtureData = await getFixturesForTeam(slug);

	if (!fixtureData) {
		return new Response('Not Found', { status: 404 });
	}

	const ical = buildIcal(fixtureData.fixtures, fixtureData.competition, fixtureData.season, slug);

	return new Response(ical, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': `attachment; filename="${slug}-fixtures.ics"`
		}
	});
}
