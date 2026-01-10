import type { Club, ClubsData, EnrichedFixture, FixtureData } from '@/types/match';
import clubsData from './clubs.json';
import seniorsData from './seniors.json';

const clubs = clubsData as ClubsData;
const seniors = seniorsData as FixtureData;

export function getClubs(): Club[] {
	return clubs.clubs;
}

export function getClubById(id: number): Club | undefined {
	return clubs.clubs.find((club) => club.id === id);
}

export function getSeniorsFixtures(): EnrichedFixture[] {
	return seniors.fixtures.map((fixture) => {
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

export function getSeniorsCompetition(): string {
	return seniors.competition;
}

export function getSeniorsSeason(): number {
	return seniors.season;
}
