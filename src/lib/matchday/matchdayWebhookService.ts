import { verifyWebhookSignature } from '@dejanvasic85/matchday-sdk';
import { z } from 'zod';

const leagueIdPattern = /^lea_[A-Za-z0-9_-]+$/;
const maximumLeagueIdLength = 200;

const matchdayWebhookPayloadSchema = z.object({
	leagueId: z
		.string()
		.max(maximumLeagueIdLength)
		.regex(leagueIdPattern, 'League ID must be a Matchday league ID'),
	hasChanges: z.boolean(),
	crawledAt: z.iso.datetime({ offset: true })
});

export type MatchdayWebhookPayload = z.infer<typeof matchdayWebhookPayloadSchema>;

export type MatchdayWebhookDependencies = {
	webhookSecret: string;
	revalidateLeague: (leagueId: string) => void;
};

export type MatchdayWebhookInput = {
	rawBody: string;
	signatureHeader: string | null;
};

export type MatchdayWebhookOutcome =
	| { status: 'unauthorized' }
	| { status: 'invalid-payload' }
	| {
			status: 'accepted';
			payload: MatchdayWebhookPayload;
			revalidated: boolean;
	  };

function parseWebhookPayload(rawBody: string): MatchdayWebhookPayload | null {
	try {
		const result = matchdayWebhookPayloadSchema.safeParse(JSON.parse(rawBody));
		return result.success ? result.data : null;
	} catch {
		return null;
	}
}

export async function handleMatchdayWebhook(
	dependencies: MatchdayWebhookDependencies,
	input: MatchdayWebhookInput
): Promise<MatchdayWebhookOutcome> {
	const isValidSignature = await verifyWebhookSignature(
		input.rawBody,
		input.signatureHeader,
		dependencies.webhookSecret
	);

	if (!isValidSignature) {
		return { status: 'unauthorized' };
	}

	const payload = parseWebhookPayload(input.rawBody);
	if (!payload) {
		return { status: 'invalid-payload' };
	}

	if (payload.hasChanges) {
		dependencies.revalidateLeague(payload.leagueId);
	}

	return {
		status: 'accepted',
		payload,
		revalidated: payload.hasChanges
	};
}
