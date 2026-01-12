import { z } from 'zod';

const externalAddressSchema = z.object({
	address_line_1: z.string().nullable(),
	address_line_2: z.string().nullable(),
	city: z.string().nullable(),
	state: z.string().nullable(),
	country: z.string().nullable(),
	postcode: z.string().nullable()
});

const externalSocialSchema = z.object({
	name: z.enum(['facebook', 'instagram', 'twitter']),
	value: z.url()
});

const externalClubAttributesSchema = z.object({
	name: z.string(),
	slug: z.string().nullable(),
	image: z.url(),
	alt_image: z.string().nullable(),
	phone: z.string().nullable(),
	email: z.string().nullable(),
	email_address: z.string().nullable(),
	url: z.string().nullable(),
	color: z.string().nullable(),
	accent: z.string().nullable(),
	address: externalAddressSchema.nullable(),
	socials: z.array(externalSocialSchema).nullable(),
	grounds: z.any().nullable()
});

const externalClubSchema = z.object({
	type: z.literal('clubs'),
	id: z.string(),
	attributes: externalClubAttributesSchema,
	links: z.object({
		self: z.object({
			href: z.url()
		})
	})
});

export const externalApiResponseSchema = z.object({
	data: z.array(externalClubSchema)
});

const addressSchema = z.object({
	street: z.string(),
	city: z.string(),
	state: z.string(),
	postcode: z.string()
});

const socialSchema = z.object({
	platform: z.enum(['facebook', 'instagram', 'twitter']),
	url: z.url()
});

export const clubSchema = z.object({
	externalId: z.string(),
	name: z.string(),
	displayName: z.string(),
	logoUrl: z.url(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	website: z.url().optional(),
	address: addressSchema.optional(),
	socials: z.array(socialSchema).optional()
});

export const clubsSchema = z.object({
	clubs: z.array(clubSchema)
});

const externalFixtureAttributesSchema = z.object({
	name: z.string(),
	date: z.string(),
	round: z.string(),
	full_round: z.string(),
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

export const fixtureSchema = z.object({
	round: z.number(),
	date: z.string(),
	day: z.string(),
	time: z.string(),
	homeTeamId: z.string(),
	awayTeamId: z.string(),
	address: z.string(),
	coordinates: z.string()
});

export const fixtureDataSchema = z.object({
	competition: z.string(),
	season: z.number(),
	totalFixtures: z.number(),
	totalRounds: z.number().optional(),
	fixtures: z.array(fixtureSchema)
});

export type ExternalApiResponse = z.infer<typeof externalApiResponseSchema>;
export type ExternalClub = z.infer<typeof externalClubSchema>;
export type Club = z.infer<typeof clubSchema>;
export type Clubs = z.infer<typeof clubsSchema>;

export type ExternalFixturesApiResponse = z.infer<typeof externalFixturesApiResponseSchema>;
export type ExternalFixture = z.infer<typeof externalFixtureSchema>;
export type Fixture = z.infer<typeof fixtureSchema>;
export type FixtureData = z.infer<typeof fixtureDataSchema>;

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
