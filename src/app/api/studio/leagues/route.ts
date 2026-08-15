import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import logger from '@/lib/logger';
import { getClubLeagueOptions } from '@/lib/matchday/leagueOptionService';

const log = logger.child({ route: '/api/studio/leagues' });
const standaloneStudioOrigin = 'https://williamstownsc.sanity.studio';

/**
 * No auth: the referer-based guard this used to have was unreliable — browsers often omit
 * or strip the Referer header on cross-origin requests from the standalone
 * williamstownsc.sanity.studio deploy, causing false 401s. The data here (league names)
 * isn't sensitive, so this is left open rather than gated on a spoofable, flaky header
 * (docs/plans/2026-08-15-team-league-picker-design-spike.md).
 */
const corsHeaders = { 'Access-Control-Allow-Origin': standaloneStudioOrigin };

export async function GET() {
	try {
		const options = await getClubLeagueOptions();
		return NextResponse.json({ options }, { headers: corsHeaders });
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'studio leagues API error');

		const isDev = process.env.NODE_ENV !== 'production';
		const responseBody: { error: string; details?: string } = { error: 'Failed to load leagues' };

		if (isDev && error instanceof Error) {
			responseBody.details = error.message;
		}

		return NextResponse.json(responseBody, { status: 500, headers: corsHeaders });
	}
}
