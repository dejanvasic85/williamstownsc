import { z } from 'zod';

const externalTableEntryAttributesSchema = z.object({
	team_hash_id: z.string(),
	team_name: z.string(),
	club_name: z.string(),
	club_logo: z.string(),
	season_name: z.string(),
	league_name: z.string(),
	position: z.number().int(),
	played: z.number().int(),
	won: z.number().int(),
	drawn: z.number().int(),
	lost: z.number().int(),
	goals_for: z.number().int(),
	goals_against: z.number().int(),
	goal_difference: z.number().int(),
	points: z.number().int(),
	stage_order: z.number().nullable(),
	pool_name: z.string().nullable(),
	upcoming_matches: z.array(z.any()).optional(),
	recent_matches: z.array(z.any()).optional()
});

const externalTableEntrySchema = z.object({
	type: z.literal('ladder-entry'),
	id: z.string(),
	attributes: externalTableEntryAttributesSchema
});

export const externalTableApiResponseSchema = z.object({
	data: z.array(externalTableEntrySchema),
	point_adjustments: z.any().nullable()
});

export type ExternalTableApiResponse = z.infer<typeof externalTableApiResponseSchema>;
export type ExternalTableEntry = z.infer<typeof externalTableEntrySchema>;

export type TableEntry = {
	teamId: string;
	teamName: string;
	clubName: string;
	logoUrl: string;
	position: number;
	played: number;
	wins: number;
	draws: number;
	losses: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
	points: number;
};

export type TableData = {
	season: number;
	competition: string;
	entries: TableEntry[];
};

export const tableDataSchema = z.object({
	season: z.number().int(),
	competition: z.string(),
	entries: z.array(
		z.object({
			teamId: z.string(),
			teamName: z.string(),
			clubName: z.string(),
			logoUrl: z.string(),
			position: z.number().int(),
			played: z.number().int(),
			wins: z.number().int(),
			draws: z.number().int(),
			losses: z.number().int(),
			goalsFor: z.number().int(),
			goalsAgainst: z.number().int(),
			goalDifference: z.number().int(),
			points: z.number().int()
		})
	)
});
