import { type MetaConfig, getMetaConfig, isLocal } from '@/lib/config';
import logger from '@/lib/logger';

const log = logger.child({ module: 'social-publish' });

export type PublishResult = {
	platform: 'facebook' | 'instagram';
	success: boolean;
	postId?: string;
	error?: string;
};

export type SocialPublishArticle = {
	title: string;
	excerpt: string;
	imageUrl: string;
	articleUrl: string;
	publishToFacebook?: boolean;
	publishToInstagram?: boolean;
};

type FacebookPhotoResponse = {
	id: string;
	post_id: string;
};

type InstagramContainerResponse = {
	id: string;
};

type InstagramContainerStatusResponse = {
	status_code: 'EXPIRED' | 'ERROR' | 'FINISHED' | 'IN_PROGRESS' | 'PUBLISHED';
	id: string;
};

type InstagramPublishResponse = {
	id: string;
};

const metaApiBaseUrl = 'https://graph.facebook.com/v22.0';
const maxInstagramCaptionLength = 2200;
const instagramPollIntervalMs = 2000;
const instagramMaxPollAttempts = 30;
const defaultHashtags = '#WilliamstownSC #WeAreWilliamstown';

function buildCaption(article: SocialPublishArticle): string {
	const parts = [article.title];

	if (article.excerpt) {
		parts.push('', article.excerpt);
	}

	parts.push('', `Read more: ${article.articleUrl}`, '', defaultHashtags);

	return parts.join('\n');
}

function truncateCaption(caption: string, maxLength: number): string {
	if (caption.length <= maxLength) {
		return caption;
	}

	const truncated = caption.slice(0, maxLength - 3);
	return `${truncated}...`;
}

async function callMetaApi<T>(
	endpoint: string,
	accessToken: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `${metaApiBaseUrl}${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		let errorMessage = response.statusText;
		try {
			const error = await response.json();
			errorMessage = error.error?.message || response.statusText;
		} catch {
			// response was not JSON (e.g. HTML error page)
		}
		throw new Error(`Meta API error: ${errorMessage} (${response.status})`);
	}

	return response.json();
}

async function pollInstagramContainerStatus(
	containerId: string,
	accessToken: string
): Promise<void> {
	let attempts = 0;

	while (attempts < instagramMaxPollAttempts) {
		const status = await callMetaApi<InstagramContainerStatusResponse>(
			`/${containerId}?fields=status_code`,
			accessToken,
			{ method: 'GET' }
		);

		if (status.status_code === 'FINISHED') {
			return;
		}

		if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
			throw new Error(`Instagram container ${status.status_code.toLowerCase()}`);
		}

		attempts++;
		await new Promise((resolve) => setTimeout(resolve, instagramPollIntervalMs));
	}

	throw new Error('Instagram container processing timeout');
}

export async function publishToFacebook(
	article: SocialPublishArticle,
	config: MetaConfig
): Promise<PublishResult> {
	try {
		const caption = buildCaption(article);

		const formData = new URLSearchParams();
		formData.append('url', article.imageUrl);
		formData.append('message', caption);

		const response = await callMetaApi<FacebookPhotoResponse>(
			`/${config.metaFacebookPageId}/photos`,
			config.metaPageAccessToken,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: formData.toString()
			}
		);

		return {
			platform: 'facebook',
			success: true,
			postId: response.post_id || response.id
		};
	} catch (error) {
		return {
			platform: 'facebook',
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

export async function publishToInstagram(
	article: SocialPublishArticle,
	config: MetaConfig
): Promise<PublishResult> {
	try {
		const caption = truncateCaption(buildCaption(article), maxInstagramCaptionLength);

		const createParams = new URLSearchParams();
		createParams.append('image_url', article.imageUrl);
		createParams.append('caption', caption);

		const containerResponse = await callMetaApi<InstagramContainerResponse>(
			`/${config.metaInstagramAccountId}/media`,
			config.metaPageAccessToken,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: createParams.toString()
			}
		);

		await pollInstagramContainerStatus(containerResponse.id, config.metaPageAccessToken);

		const publishParams = new URLSearchParams();
		publishParams.append('creation_id', containerResponse.id);

		const publishResponse = await callMetaApi<InstagramPublishResponse>(
			`/${config.metaInstagramAccountId}/media_publish`,
			config.metaPageAccessToken,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: publishParams.toString()
			}
		);

		return {
			platform: 'instagram',
			success: true,
			postId: publishResponse.id
		};
	} catch (error) {
		return {
			platform: 'instagram',
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

export async function publishArticleToSocials(
	article: SocialPublishArticle
): Promise<PublishResult[]> {
	if (isLocal()) {
		log.debug('skipping social media publishing in local environment');
		return [];
	}

	const config = getMetaConfig();

	const tasks: Promise<PublishResult>[] = [];
	const taskPlatforms: Array<PublishResult['platform']> = [];

	if (config.facebookEnabled && (article.publishToFacebook ?? true)) {
		tasks.push(publishToFacebook(article, config));
		taskPlatforms.push('facebook');
	}

	if (config.instagramEnabled && (article.publishToInstagram ?? true)) {
		tasks.push(publishToInstagram(article, config));
		taskPlatforms.push('instagram');
	}

	if (tasks.length === 0) {
		return [];
	}

	const results = await Promise.allSettled(tasks);

	return results.map((result, index) => {
		if (result.status === 'fulfilled') {
			return result.value;
		}
		return {
			platform: taskPlatforms[index],
			success: false,
			error: result.reason instanceof Error ? result.reason.message : 'Promise rejected'
		};
	});
}
