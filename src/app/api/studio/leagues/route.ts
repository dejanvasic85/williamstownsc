import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import logger from '@/lib/logger';
import { getClubLeagueOptions } from '@/lib/matchday/leagueOptionService';

const log = logger.child({ route: '/api/studio/leagues' });

export async function GET() {
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
