import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getMatchdayWebhookConfig } from '@/lib/config';
import logger from '@/lib/logger';
import { buildMatchdayLeagueCacheTag } from '@/lib/matchday/matchdayCacheService';
import {
	type MatchdayWebhookOutcome,
	handleMatchdayWebhook
} from '@/lib/matchday/matchdayWebhookService';

const routePath = '/api/webhooks/league-updates';
const matchdaySignatureHeader = 'x-matchday-signature';
const log = logger.child({ route: routePath });

function revalidateLeague(leagueId: string): void {
	revalidateTag(buildMatchdayLeagueCacheTag(leagueId), { expire: 0 });
}

function createWebhookResponse(outcome: MatchdayWebhookOutcome): NextResponse {
	switch (outcome.status) {
		case 'unauthorized':
			log.warn('league update webhook signature rejected');
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		case 'invalid-payload':
			log.warn('league update webhook payload rejected');
			return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
		case 'accepted': {
			const { leagueId, hasChanges, crawledAt } = outcome.payload;
			log.info(
				{ leagueId, hasChanges, crawledAt, revalidated: outcome.revalidated },
				'league update webhook accepted'
			);
			return NextResponse.json({
				accepted: true,
				leagueId,
				revalidated: outcome.revalidated
			});
		}
	}
}

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const rawBody = await request.text();
		const signatureHeader = request.headers.get(matchdaySignatureHeader);
		const { matchdayWebhookSecret } = getMatchdayWebhookConfig();
		const outcome = await handleMatchdayWebhook(
			{
				webhookSecret: matchdayWebhookSecret,
				revalidateLeague
			},
			{ rawBody, signatureHeader }
		);

		return createWebhookResponse(outcome);
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'league update webhook failed');
		return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
	}
}
