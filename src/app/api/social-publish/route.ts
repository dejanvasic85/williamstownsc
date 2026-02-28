import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { getSocialPublishConfig } from '@/lib/config';
import { getArticleForSocialPublish } from '@/lib/content/news';
import { getSiteSettings } from '@/lib/content/siteSettings';
import logger from '@/lib/logger';
import { publishArticleToSocials } from '@/lib/social/metaPublishService';
import { buildUrl } from '@/lib/url/buildUrl';

const log = logger.child({ route: '/api/social-publish' });

export const maxDuration = 60;

const webhookPayloadSchema = z.object({
	_id: z.string().min(1, 'Article ID is required'),
	_type: z.string().min(1, 'Content type is required'),
	slug: z
		.object({
			current: z.string().optional()
		})
		.optional()
});

export async function POST(request: NextRequest) {
	try {
		const publishSecret = request.headers.get('x-social-publish-secret');
		const { socialPublishSecret } = getSocialPublishConfig();

		if (publishSecret !== socialPublishSecret) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		log.info({ articleId: body._id, contentType: body._type }, 'social publish request received');

		const validationResult = webhookPayloadSchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid payload',
					details: validationResult.error.flatten()
				},
				{ status: 400 }
			);
		}

		const { _id, _type } = validationResult.data;

		if (_type !== 'newsArticle') {
			return NextResponse.json(
				{
					error: 'Invalid content type',
					message: 'Only newsArticle content type is supported',
					receivedType: _type
				},
				{ status: 400 }
			);
		}

		const article = await getArticleForSocialPublish(_id);

		if (!article) {
			return NextResponse.json(
				{
					error: 'Article not found',
					articleId: _id
				},
				{ status: 404 }
			);
		}

		if (!article.publishToFacebook && !article.publishToInstagram) {
			return NextResponse.json({
				skipped: true,
				reason: 'Article has both publishToFacebook and publishToInstagram set to false',
				articleId: _id,
				timestamp: new Date().toISOString()
			});
		}

		if (!article.featuredImage) {
			return NextResponse.json(
				{
					error: 'Featured image required',
					message: 'Article must have a featured image to publish to social media',
					articleId: _id
				},
				{ status: 400 }
			);
		}

		const siteSettings = await getSiteSettings();
		if (!siteSettings?.canonicalUrl) {
			return NextResponse.json(
				{
					error: 'Site configuration error',
					message: 'Canonical URL not configured in site settings'
				},
				{ status: 500 }
			);
		}

		const articleUrl = buildUrl(siteSettings.canonicalUrl, 'news', article.slug);

		const results = await publishArticleToSocials({
			title: article.title,
			excerpt: article.excerpt,
			imageUrl: article.featuredImage.url,
			articleUrl,
			publishToFacebook: article.publishToFacebook,
			publishToInstagram: article.publishToInstagram
		});

		const successCount = results.filter((r) => r.success).length;
		const failureCount = results.filter((r) => !r.success).length;

		log.info({ articleId: _id, successCount, failureCount }, 'social publish completed');

		if (failureCount === 0) {
			return NextResponse.json({
				success: true,
				message: 'Published to all platforms',
				articleId: _id,
				results,
				timestamp: new Date().toISOString()
			});
		}

		if (successCount === 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'Failed to publish to all platforms',
					articleId: _id,
					results,
					timestamp: new Date().toISOString()
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: 'Partial success',
				articleId: _id,
				results,
				timestamp: new Date().toISOString()
			},
			{ status: 207 }
		);
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'social publish error');

		const isDev = process.env.NODE_ENV !== 'production';
		const responseBody: { error: string; details?: string } = {
			error: 'Failed to publish to social media'
		};

		if (isDev) {
			responseBody.details = error instanceof Error ? error.message : 'Unknown error';
		}

		return NextResponse.json(responseBody, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({
		message: 'Social Publishing API',
		endpoint: '/api/social-publish',
		method: 'POST',
		description: 'Webhook endpoint for publishing news articles to Facebook',
		expectedHeaders: {
			'x-social-publish-secret': 'Secret token for webhook authentication',
			'Content-Type': 'application/json'
		},
		expectedBody: {
			_id: 'Document ID of the news article',
			_type: 'Content type (must be "newsArticle")',
			slug: 'Optional slug object with current property'
		},
		responseStatuses: {
			200: 'All platforms published successfully or article skipped (both platform flags false)',
			207: 'Partial success - some platforms succeeded, others failed',
			400: 'Invalid payload, wrong content type, or missing featured image',
			401: 'Invalid authentication secret',
			404: 'Article not found',
			500: 'All platforms failed or server error'
		}
	});
}
