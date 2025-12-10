import { z } from 'zod';

// Client-safe config schema (only public env vars)
const clientConfigSchema = z.object({
	sanityProjectId: z.string().min(1, 'Sanity project ID is required'),
	sanityDataset: z.string().min(1, 'Sanity dataset is required'),
	sanityApiVersion: z.string().default('2024-01-01')
});

// Server-only AWS config schema
const awsConfigSchema = z.object({
	awsRegion: z.string().min(1, 'AWS region is required'),
	awsAccessKeyId: z.string().min(1, 'AWS access key ID is required'),
	awsSecretAccessKey: z.string().min(1, 'AWS secret access key is required')
});

export type ClientConfig = z.infer<typeof clientConfigSchema>;
export type AwsConfig = z.infer<typeof awsConfigSchema>;

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
		sanityApiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION
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
