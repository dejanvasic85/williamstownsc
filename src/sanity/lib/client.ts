import { getClientConfig } from '@/lib/config';
import { createClient } from 'next-sanity';

const config = getClientConfig();

export const client = createClient({
	projectId: config.sanityProjectId,
	dataset: config.sanityDataset,
	apiVersion: config.sanityApiVersion,
	useCdn: true,
	perspective: 'published'
});
