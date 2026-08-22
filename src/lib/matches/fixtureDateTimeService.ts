import { TZDate } from '@date-fns/tz';

const melbourneTimezone = 'Australia/Melbourne';

export function parseFixtureDateTime(date: string, time: string): TZDate {
	const [year, month, day] = date.split('-').map(Number);
	const [hour, minute] = time.split(':').map(Number);
	return new TZDate(year, month - 1, day, hour, minute, melbourneTimezone);
}
