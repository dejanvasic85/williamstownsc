import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const contentType = request.headers.get('x-content-type');
		console.log('Revalidation request received. Content Type', contentType);

		if (!contentType) {
			return NextResponse.json({ error: 'x-content-type header required' }, { status: 400 });
		}

		revalidateTag(contentType);

		return NextResponse.json({
			revalidated: true,
			contentType,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Revalidation error:', error);
		return NextResponse.json(
			{
				error: 'Failed to revalidate',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		message: 'Revalidation API is working',
		endpoint: '/api/revalidate',
		method: 'POST',
		expectedHeaders: {
			'x-content-type': 'content type to revalidate (e.g., newsArticle, siteSettings, page, etc.)'
		}
	});
}
