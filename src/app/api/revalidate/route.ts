import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import logger from '@/lib/logger';
import { getTenantFromHeaders } from '@/tenants/request';
import { getTenantSecret } from '@/tenants/secrets/tenantSecrets';

const log = logger.child({ route: '/api/revalidate' });

const allowedContentTypes = new Set([
	'announcement',
	'newsArticle',
	'team',
	'sponsor',
	'program',
	'page',
	'committeePage',
	'contactPage',
	'siteSettings',
	'navigationSettings'
]);

const pageNamePattern = /^[a-zA-Z]+Page$/;

function isValidContentType(contentType: string): boolean {
	return allowedContentTypes.has(contentType) || pageNamePattern.test(contentType);
}

export async function POST(request: NextRequest) {
	try {
		// The club comes from the validated Host the proxy carries in x-tenant, never the caller.
		const tenant = await getTenantFromHeaders();
		if (!tenant) {
			return NextResponse.json({ error: 'Unknown club' }, { status: 400 });
		}

		// Verify authentication against that club's own secret
		const revalidateSecret = request.headers.get('x-revalidate-secret');
		const expectedSecret = getTenantSecret('revalidateSecret', tenant);

		if (revalidateSecret !== expectedSecret) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Extract content type from request body
		const body = await request.json();
		log.info({ contentType: body._type }, 'revalidation request received');

		const contentType = body._type;

		if (!contentType) {
			return NextResponse.json(
				{ error: 'Content type required in request body (_type field)' },
				{ status: 400 }
			);
		}

		// Validate content type against allowlist
		if (!isValidContentType(contentType)) {
			return NextResponse.json(
				{
					error: 'Invalid content type',
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
		Sentry.captureException(error);
		log.error({ err: error }, 'revalidation error');

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
			'x-revalidate-secret': 'secret token for authentication'
		},
		expectedBody: {
			_type: 'content type to revalidate (e.g., newsArticle, team, sponsor, etc.)'
		}
	});
}
