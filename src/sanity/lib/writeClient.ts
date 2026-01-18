import { createClient } from 'next-sanity';
import { getClientConfig, getSanityWriteConfig } from '@/lib/config';

const config = getClientConfig();

/**
 * Server-side Sanity client with write permissions
 * Used for creating and updating documents programmatically
 * IMPORTANT: Only use on the server - never expose write token to client
 */
export const writeClient = createClient({
	projectId: config.sanityProjectId,
	dataset: config.sanityDataset,
	apiVersion: config.sanityApiVersion,
	useCdn: false, // Must be false for mutations
	token: getSanityWriteConfig().sanityWriteToken,
	perspective: 'published'
});
