import { NextRequest, NextResponse } from 'next/server';
import { searchContent } from '@/lib/content/search';

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
		console.error('Search API error:', error);

		const isDev = process.env.NODE_ENV !== 'production';
		const responseBody: { error: string; details?: string } = {
			error: 'Failed to perform search'
		};

		if (isDev) {
			responseBody.details = error instanceof Error ? error.message : 'Unknown error';
		}

		return NextResponse.json(responseBody, { status: 500 });
	}
}
