import { z } from 'zod';

const configSchema = z.object({
	sanityProjectId: z.string().min(1, 'Sanity project ID is required'),
	sanityDataset: z.string().min(1, 'Sanity dataset is required'),
	sanityApiVersion: z.string().default('2024-01-01')
});

export type Config = z.infer<typeof configSchema>;

let cachedConfig: Config | null = null;

export function getConfig(): Config {
	if (cachedConfig) {
		return cachedConfig;
	}

	const config = configSchema.parse({
		sanityProjectId: process.env.SANITY_PROJECT_ID,
		sanityDataset: process.env.SANITY_DATASET,
		sanityApiVersion: process.env.SANITY_API_VERSION
	});

	cachedConfig = config;
	return config;
}
