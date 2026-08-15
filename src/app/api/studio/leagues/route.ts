import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import logger from '@/lib/logger';
import { getClubLeagueOptions } from '@/lib/matchday/leagueOptionService';

const log = logger.child({ route: '/api/studio/leagues' });
const studioPathPrefix = '/studio';
const standaloneStudioOrigin = 'https://williamstownsc.sanity.studio';

/**
 * Soft guard, not real auth: rejects requests without a referer from either the
 * Next.js-embedded studio (same origin, /studio path) or the standalone deployed studio
 * (williamstownsc.sanity.studio) to keep this off casual/scripted hits and spare the
 * matchday API token's quota. A determined caller can still spoof the header — the data
 * here (league names) isn't sensitive, so that's an accepted tradeoff
 * (docs/plans/2026-08-15-team-league-picker-design-spike.md).
 */
function isFromStudio(refererUrl: URL, requestOrigin: string): boolean {
	const isEmbeddedStudio =
		refererUrl.origin === requestOrigin && refererUrl.pathname.startsWith(studioPathPrefix);
	const isStandaloneStudio = refererUrl.origin === standaloneStudioOrigin;

	return isEmbeddedStudio || isStandaloneStudio;
}

function parseRefererUrl(request: NextRequest): URL | null {
	const referer = request.headers.get('referer');
	if (!referer) {
		return null;
	}

	try {
		return new URL(referer);
	} catch {
		return null;
	}
}

export async function GET(request: NextRequest) {
	const refererUrl = parseRefererUrl(request);
	if (!refererUrl || !isFromStudio(refererUrl, request.nextUrl.origin)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const corsHeaders =
		refererUrl.origin === standaloneStudioOrigin
			? { 'Access-Control-Allow-Origin': standaloneStudioOrigin }
			: undefined;

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
