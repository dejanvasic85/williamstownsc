export type Club = {
	id: number;
	name: string;
	displayName: string;
	logoUrl: string;
};

export type ClubsData = {
	league: string;
	season: number;
	competition: string;
	totalClubs: number;
	clubs: Club[];
};

export type Fixture = {
	round: number;
	date: string;
	day: string;
	time: string;
	homeTeamId: number;
	awayTeamId: number;
	address: string;
	coordinates: string;
};

export type FixtureData = {
	league: string;
	season: number;
	competition: string;
	totalFixtures: number;
	totalRounds: number;
	fixtures: Fixture[];
};

export type EnrichedFixture = {
	round: number;
	date: string;
	day: string;
	time: string;
	homeTeam: Club;
	awayTeam: Club;
	address: string;
	coordinates: string;
};
