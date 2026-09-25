import { z } from 'zod';

// Client-safe config schema (only public env vars)
const clientConfigSchema = z.object({
	recaptchaSiteKey: z.string().optional()
});

// Server-only Sanity config. Project id and dataset come from the tenant registry, so only the
// API version stays in the environment.
const sanityConfigSchema = z.object({
	apiVersion: z.string().default('2024-01-01')
});

const studioConfigSchema = z.object({
	siteUrl: z.url()
});

// Server-only AWS config schema
const awsConfigSchema = z.object({
	awsRegion: z.string().min(1, 'AWS region is required'),
	awsAccessKeyId: z.string().min(1, 'AWS access key ID is required'),
	awsSecretAccessKey: z.string().min(1, 'AWS secret access key is required')
});

// Server-only reCAPTCHA config schema
const recaptchaConfigSchema = z.object({
	recaptchaSecretKey: z.string().min(1, 'reCAPTCHA secret key is required'),
	googleCloudProjectId: z.string().min(1, 'Google Cloud project ID is required'),
	riskScoreThreshold: z.number().min(0).max(1).default(0.5)
});

// Server-only social publish config schema
const socialPublishConfigSchema = z.object({
	socialPublishSecret: z.string().min(1, 'Social publish secret is required')
});

// Server-only matchday API config schema
const matchdayConfigSchema = z.object({
	matchdayApiToken: z.string().min(1, 'Matchday API token is required'),
	matchdayApiBaseUrl: z.string().url('Matchday API base URL is required')
});

const matchdayWebhookConfigSchema = z.object({
	matchdayWebhookSecret: z.string().min(1, 'Matchday webhook secret is required')
});

export type ClubConfig = {
	wscClubName: string;
};
export type ClientConfig = z.infer<typeof clientConfigSchema>;
export type SanityConfig = z.infer<typeof sanityConfigSchema>;
export type StudioConfig = z.infer<typeof studioConfigSchema>;
export type AwsConfig = z.infer<typeof awsConfigSchema>;
export type RecaptchaConfig = z.infer<typeof recaptchaConfigSchema>;
export type SocialPublishConfig = z.infer<typeof socialPublishConfigSchema>;
export type MatchdayConfig = z.infer<typeof matchdayConfigSchema>;
export type MatchdayWebhookConfig = z.infer<typeof matchdayWebhookConfigSchema>;

/**
 * Get client-safe config (can be used in both server and client)
 * Only contains public environment variables
 */
export function getClientConfig(): ClientConfig {
	return clientConfigSchema.parse({
		recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
	});
}

/**
 * Get the Sanity config that is shared by every club (server-only).
 * The project id and dataset are per club and come from the tenant registry, not the environment.
 */
export function getSanityConfig(): SanityConfig {
	return sanityConfigSchema.parse({
		apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION
	});
}

/**
 * Get Sanity Studio-bundled config
 * Only reads SANITY_STUDIO_-prefixed vars, the only prefix Sanity's Studio build inlines
 */
export function getStudioConfig(): StudioConfig {
	return studioConfigSchema.parse({
		siteUrl: process.env.SANITY_STUDIO_SITE_URL
	});
}

/**
 * Get AWS config (server-only)
 * Contains secret credentials
 */
export function getAwsConfig(): AwsConfig {
	return awsConfigSchema.parse({
		awsRegion: process.env.AWS_REGION,
		awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
		awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	});
}

export function isLocal(): boolean {
	return process.env.NEXT_PUBLIC_ENV === 'local';
}

export function isSentryEnabled(): boolean {
	if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== undefined) {
		return process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true';
	}
	return process.env.NODE_ENV === 'production';
}

/**
 * Get reCAPTCHA config (server-only)
 * Contains secret credentials for token verification
 */
export function getRecaptchaConfig(): RecaptchaConfig {
	const riskScoreThreshold =
		process.env.RECAPTCHA_RISK_SCORE_THRESHOLD !== undefined
			? parseFloat(process.env.RECAPTCHA_RISK_SCORE_THRESHOLD)
			: 0.5;

	return recaptchaConfigSchema.parse({
		recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
		googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
		riskScoreThreshold
	});
}

/**
 * Get social publish config (server-only)
 * Contains secret for social publishing webhook endpoint
 */
export function getSocialPublishConfig(): SocialPublishConfig {
	return socialPublishConfigSchema.parse({
		socialPublishSecret: process.env.SOCIAL_PUBLISH_SECRET
	});
}

export function getClubConfig(): ClubConfig {
	return { wscClubName: 'Williamstown' };
}

/**
 * Get matchday API config (server-only)
 * Contains the bearer token and base URL for the matchday SDK client
 */
export function getMatchdayConfig(): MatchdayConfig {
	return matchdayConfigSchema.parse({
		matchdayApiToken: process.env.MATCHDAY_API_TOKEN,
		matchdayApiBaseUrl: process.env.MATCHDAY_API_BASE_URL
	});
}

export function getMatchdayWebhookConfig(): MatchdayWebhookConfig {
	return matchdayWebhookConfigSchema.parse({
		matchdayWebhookSecret: process.env.MATCHDAY_WEBHOOK_SECRET
	});
}
