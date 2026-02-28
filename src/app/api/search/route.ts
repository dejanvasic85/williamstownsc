import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { searchContent } from '@/lib/content/search';
import logger from '@/lib/logger';

const log = logger.child({ route: '/api/search' });

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get('q');

		if (!query) {
			return NextResponse.json(
				{ error: 'Search query parameter "q" is required' },
				{ status: 400 }
			);
		}

		const trimmedQuery = query.trim();

		if (trimmedQuery.length < 2) {
			return NextResponse.json(
				{ error: 'Search query must be at least 2 characters long' },
				{ status: 400 }
			);
		}

		const results = await searchContent(trimmedQuery);

		return NextResponse.json({
			results,
			query: trimmedQuery,
			count: results.length
		});
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'search API error');

		const isDev = process.env.NODE_ENV !== 'production';
		const responseBody: { error: string; details?: string; stack?: string } = {
			error: 'Failed to perform search'
		};

		if (isDev && error instanceof Error) {
			responseBody.details = error.message;
			responseBody.stack = error.stack;
		}

		return NextResponse.json(responseBody, { status: 500 });
	}
}
