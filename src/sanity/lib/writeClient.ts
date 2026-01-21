import { type SanityClient, createClient } from 'next-sanity';
import { getClientConfig, getSanityWriteConfig } from '@/lib/config';

let cachedWriteClient: SanityClient | null = null;

/**
 * Get a server-side Sanity client with write permissions.
 * Lazily initializes the client on first use to avoid crashes
 * when SANITY_WRITE_TOKEN is missing on pages that don't need it.
 * IMPORTANT: Only use on the server - never expose write token to client
 */
export function getWriteClient(): SanityClient {
	if (cachedWriteClient) {
		return cachedWriteClient;
	}

	const config = getClientConfig();
	const writeConfig = getSanityWriteConfig();

	cachedWriteClient = createClient({
		projectId: config.sanityProjectId,
		dataset: config.sanityDataset,
		apiVersion: config.sanityApiVersion,
		useCdn: false, // Must be false for mutations
		token: writeConfig.sanityWriteToken,
		perspective: 'published'
	});

	return cachedWriteClient;
}
