import clubsData from '@data/clubs/clubs.json';
import { z } from 'zod';
import type { Fixture } from '@/types/match';
import { clubsSchema } from './clubSchema';

// External API Response Schema (JSON:API format from Dribl)
const externalFixtureAttributesSchema = z.object({
	name: z.string(),
	date: z.string(), // ISO 8601 timestamp
	round: z.string(), // "R1", "R2", etc.
	full_round: z.string(), // "Round 1", "Round 2", etc.
	ground_name: z.string(),
	ground_latitude: z.number(),
	ground_longitude: z.number(),
	ground_address: z.string().nullable(),
	field_name: z.string(),
	is_historic_field: z.boolean(),
	home_team_name: z.string(),
	home_logo: z.url(),
	away_team_name: z.string(),
	away_logo: z.url(),
	competition_name: z.string(),
	league_name: z.string(),
	status: z.string(),
	bye_flag: z.boolean(),
	is_unstructured: z.boolean(),
	league_result_access: z.string(),
	home_score: z.number().nullable(),
	home_score_extra: z.number().nullable(),
	home_score_penalty: z.number().nullable(),
	home_score_half: z.number().nullable(),
	home_score_extra_half: z.number().nullable(),
	away_score: z.number().nullable(),
	away_score_extra: z.number().nullable(),
	away_score_penalty: z.number().nullable(),
	away_score_half: z.number().nullable(),
	away_score_extra_half: z.number().nullable(),
	allocated_center_referee: z.boolean(),
	allocated_assistant_referee_1: z.boolean(),
	allocated_assistant_referee_2: z.boolean(),
	allocated_fourth_official: z.boolean(),
	allocated_game_leader: z.boolean(),
	referee_count: z.number(),
	enable_referees_allocated: z.boolean(),
	match_hash_id: z.string(),
	forfeit_team_hash_id: z.string().nullable(),
	home_team_hash_id: z.string(),
	away_team_hash_id: z.string()
});

const externalFixtureSchema = z.object({
	type: z.literal('fixtures'),
	hash_id: z.string(),
	attributes: externalFixtureAttributesSchema,
	links: z.object({
		self: z.object({
			href: z.url()
		})
	})
});

export const externalFixturesApiResponseSchema = z.object({
	data: z.array(externalFixtureSchema),
	links: z.object({
		first: z.url().nullable(),
		last: z.url().nullable(),
		prev: z.url().nullable(),
		next: z.url().nullable()
	}),
	meta: z.object({
		path: z.url(),
		per_page: z.number(),
		next_cursor: z.string().nullable(),
		prev_cursor: z.string().nullable()
	})
});

// Internal fixture format schema
const fixtureSchema = z.object({
	round: z.number(),
	date: z.string(), // ISO YYYY-MM-DD
	day: z.string(),
	time: z.string(),
	homeTeamId: z.string(), // Club externalId
	awayTeamId: z.string(), // Club externalId
	address: z.string(),
	coordinates: z.string() // "lat,lng"
});

export const fixtureDataSchema = z.object({
	competition: z.string(),
	season: z.number(),
	totalFixtures: z.number(),
	totalRounds: z.number().optional(),
	fixtures: z.array(fixtureSchema)
});

// Types
export type ExternalFixturesApiResponse = z.infer<typeof externalFixturesApiResponseSchema>;
export type ExternalFixture = z.infer<typeof externalFixtureSchema>;

// Helper functions for club lookup
const clubs = clubsSchema.parse(clubsData);

function findClubByLogoUrl(logoUrl: string): string | null {
	const club = clubs.clubs.find((c) => c.logoUrl === logoUrl);
	return club?.externalId || null;
}

function findClubByName(teamName: string): string | null {
	// Remove "Seniors" suffix for matching
	const cleanName = teamName.replace(/\s+Seniors\s*$/, '').trim();

	const club = clubs.clubs.find((c) => {
		const clubCleanName = c.name.trim();
		const clubDisplayCleanName = c.displayName.replace(/\s+Seniors\s*$/, '').trim();

		return clubCleanName === cleanName || clubDisplayCleanName === cleanName;
	});

	return club?.externalId || null;
}

function findClubExternalId(teamName: string, logoUrl: string): string {
	// Try logo URL first (more reliable)
	const byLogo = findClubByLogoUrl(logoUrl);
	if (byLogo) {
		return byLogo;
	}

	// Fallback to name matching
	const byName = findClubByName(teamName);
	if (byName) {
		return byName;
	}

	throw new Error(`Could not find club for team: ${teamName} (logo: ${logoUrl})`);
}

// Transformation function
export function transformExternalFixture(externalFixture: ExternalFixture): Fixture {
	const { attributes } = externalFixture;

	// Parse round number from "R1" -> 1
	const roundNumber = parseInt(attributes.round.replace(/^R/, ''), 10);

	// Parse date/time from ISO 8601 timestamp
	const fixtureDate = new Date(attributes.date);
	const dateStr = fixtureDate.toISOString().split('T')[0]; // YYYY-MM-DD
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

	// Combine ground and field name
	const address = attributes.field_name
		? `${attributes.ground_name} ${attributes.field_name}`
		: attributes.ground_name;

	// Format coordinates
	const coordinates = `${attributes.ground_latitude},${attributes.ground_longitude}`;

	// Find club external IDs
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
