import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import logger from '@/lib/logger';
import { getClubLeagueOptions } from '@/lib/matchday/leagueOptionService';
import { getTenantFromHeaders } from '@/tenants/request';

const log = logger.child({ route: '/api/studio/leagues' });

// League names aren't sensitive, and the Studio App hosting origin (sanity.io) isn't
// fixed to this project, so allow any origin rather than tracking it.
const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

export async function GET() {
	try {
		const tenant = await getTenantFromHeaders();
		const options = await getClubLeagueOptions(tenant ?? undefined);
		return NextResponse.json({ options }, { headers: corsHeaders });
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'studio leagues API error');
		const responseBody: { error: string; details?: string } = { error: 'Failed to load leagues' };
		return NextResponse.json(responseBody, { status: 500, headers: corsHeaders });
	}
}
