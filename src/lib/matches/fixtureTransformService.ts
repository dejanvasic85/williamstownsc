import { findClubExternalId } from '@/lib/clubService';
import { type ExternalFixture, type Fixture, fixtureSchema } from '@/types/matches';

export function transformExternalFixture(externalFixture: ExternalFixture): Fixture {
	const { attributes } = externalFixture;

	const roundNumber = parseInt(attributes.round.replace(/^R/, ''), 10);

	const fixtureDate = new Date(attributes.date);
	const dateStr = fixtureDate.toISOString().split('T')[0];
	const timeStr = fixtureDate.toLocaleTimeString('en-AU', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZone: 'Australia/Melbourne'
	});
	const dayStr = fixtureDate.toLocaleDateString('en-AU', {
		weekday: 'long',
		timeZone: 'Australia/Melbourne'
	});

	const address = attributes.field_name
		? `${attributes.ground_name} ${attributes.field_name}`
		: attributes.ground_name;

	const coordinates = `${attributes.ground_latitude},${attributes.ground_longitude}`;

	const homeTeamId = findClubExternalId(attributes.home_team_name, attributes.home_logo);
	const awayTeamId = findClubExternalId(attributes.away_team_name, attributes.away_logo);

	const fixture: Fixture = {
		round: roundNumber,
		date: dateStr,
		day: dayStr,
		time: timeStr,
		homeTeamId,
		awayTeamId,
		address,
		coordinates
	};

	return fixtureSchema.parse(fixture);
}
