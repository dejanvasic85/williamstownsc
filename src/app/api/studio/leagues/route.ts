import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import logger from '@/lib/logger';
import { getClubLeagueOptions } from '@/lib/matchday/leagueOptionService';

const log = logger.child({ route: '/api/studio/leagues' });
const studioPathPrefix = '/studio';

/**
 * Soft guard, not real auth: rejects requests without a same-origin /studio referer to keep
 * this off casual/scripted hits and spare the matchday API token's quota. A determined caller
 * can still spoof the header — the data here (league names) isn't sensitive, so that's an
 * accepted tradeoff (docs/plans/2026-08-15-team-league-picker-design-spike.md).
 */
function isFromStudio(request: NextRequest): boolean {
	const referer = request.headers.get('referer');
	if (!referer) {
		return false;
	}

	try {
		const refererUrl = new URL(referer);
		return (
			refererUrl.origin === request.nextUrl.origin &&
			refererUrl.pathname.startsWith(studioPathPrefix)
		);
	} catch {
		return false;
	}
}

export async function GET(request: NextRequest) {
	if (!isFromStudio(request)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const options = await getClubLeagueOptions();
		return NextResponse.json({ options });
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'studio leagues API error');

		const isDev = process.env.NODE_ENV !== 'production';
		const responseBody: { error: string; details?: string } = { error: 'Failed to load leagues' };

		if (isDev && error instanceof Error) {
			responseBody.details = error.message;
		}

		return NextResponse.json(responseBody, { status: 500 });
	}
}
