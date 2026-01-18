import { z } from 'zod';

// Client-safe config schema (only public env vars)
const clientConfigSchema = z.object({
	sanityProjectId: z.string().min(1, 'Sanity project ID is required'),
	sanityDataset: z.string().min(1, 'Sanity dataset is required'),
	sanityApiVersion: z.string().default('2024-01-01'),
	recaptchaSiteKey: z.string().optional()
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

// Server-only revalidation config schema
const revalidationConfigSchema = z.object({
	revalidateSecret: z.string().min(1, 'Revalidation secret is required')
});

// Server-only Sanity write config schema
const sanityWriteConfigSchema = z.object({
	sanityWriteToken: z.string().min(1, 'Sanity write token is required')
});

export type ClientConfig = z.infer<typeof clientConfigSchema>;
export type AwsConfig = z.infer<typeof awsConfigSchema>;
export type RecaptchaConfig = z.infer<typeof recaptchaConfigSchema>;
export type RevalidationConfig = z.infer<typeof revalidationConfigSchema>;
export type SanityWriteConfig = z.infer<typeof sanityWriteConfigSchema>;

let cachedClientConfig: ClientConfig | null = null;

/**
 * Get client-safe config (can be used in both server and client)
 * Only contains public environment variables
 */
export function getClientConfig(): ClientConfig {
	if (cachedClientConfig) {
		return cachedClientConfig;
	}

	const config = clientConfigSchema.parse({
		sanityProjectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
		sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
		sanityApiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
		recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
	});

	cachedClientConfig = config;
	return config;
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
	return process.env.ENV === 'local';
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
 * Get revalidation config (server-only)
 * Contains secret for cache revalidation endpoint
 */
export function getRevalidationConfig(): RevalidationConfig {
	return revalidationConfigSchema.parse({
		revalidateSecret: process.env.REVALIDATE_SECRET
	});
}

/**
 * Get Sanity write config (server-only)
 * Contains write token for creating/updating Sanity documents
 */
export function getSanityWriteConfig(): SanityWriteConfig {
	return sanityWriteConfigSchema.parse({
		sanityWriteToken: process.env.SANITY_WRITE_TOKEN
	});
}
