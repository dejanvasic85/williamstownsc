import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getRevalidationConfig } from '@/lib/config';

const allowedContentTypes = new Set([
	'newsArticle',
	'team',
	'sponsor',
	'program',
	'page',
	'committeePage',
	'contactPage',
	'siteSettings'
]);

const pageNamePattern = /^[a-zA-Z]+Page$/;

function isValidContentType(contentType: string): boolean {
	return allowedContentTypes.has(contentType) || pageNamePattern.test(contentType);
}

export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const revalidateSecret = request.headers.get('x-revalidate-secret');
		const { revalidateSecret: expectedSecret } = getRevalidationConfig();

		if (revalidateSecret !== expectedSecret) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Validate content type header
		const contentType = request.headers.get('x-content-type');
		console.log('Revalidation request received. Content Type:', contentType);

		if (!contentType) {
			return NextResponse.json({ error: 'x-content-type header required' }, { status: 400 });
		}

		// Validate content type against allowlist
		if (!isValidContentType(contentType)) {
			return NextResponse.json(
				{
					error: 'Invalid x-content-type header value',
					allowedContentTypes: Array.from(allowedContentTypes),
					allowedPageNamePattern: pageNamePattern.source
				},
				{ status: 400 }
			);
		}

		revalidateTag(contentType, 'max');

		return NextResponse.json({
			revalidated: true,
			contentType,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Revalidation error:', error);

		const isDev = process.env.NODE_ENV !== 'production';
		const responseBody: { error: string; details?: string } = {
			error: 'Failed to revalidate'
		};

		if (isDev) {
			responseBody.details = error instanceof Error ? error.message : 'Unknown error';
		}

		return NextResponse.json(responseBody, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({
		message: 'Revalidation API is working',
		endpoint: '/api/revalidate',
		method: 'POST',
		expectedHeaders: {
			'x-revalidate-secret': 'secret token for authentication',
			'x-content-type': 'content type to revalidate (e.g., newsArticle, siteSettings, page, etc.)'
		}
	});
}
