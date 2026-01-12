export type Club = {
	externalId: string;
	name: string;
	displayName: string;
	logoUrl: string;
};

export type Fixture = {
	round: number;
	date: string;
	day: string;
	time: string;
	homeTeamId: string;
	awayTeamId: string;
	address: string;
	coordinates: string;
};

export type FixtureData = {
	competition: string;
	clubName?: string;
	season: number;
	totalFixtures: number;
	totalRounds?: number;
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
