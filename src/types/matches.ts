import { z } from 'zod';

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

export type Club = z.infer<typeof clubSchema>;

export type EnrichedFixture = {
	round: number;
	date: string;
	day: string;
	time: string;
	homeTeam: Club;
	awayTeam: Club;
	homeTeamDisplayName: string;
	awayTeamDisplayName: string;
	address: string;
	coordinates: string;
	homeScore?: number;
	awayScore?: number;
	homeScoreHalf?: number;
	awayScoreHalf?: number;
	status?: string;
};
