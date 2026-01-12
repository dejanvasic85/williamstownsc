import type { Clubs } from '@/lib/schemas/clubSchema';
import type { FixtureData } from '@/types/match';

export function parseClubsData(data: unknown): Clubs {
	return data as Clubs;
}

export function parseFixtureData(data: unknown): FixtureData {
	return data as FixtureData;
}
