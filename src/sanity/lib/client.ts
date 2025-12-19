import { createClient } from 'next-sanity';
import { getClientConfig } from '@/lib/config';

const config = getClientConfig();

export const client = createClient({
	projectId: config.sanityProjectId,
	dataset: config.sanityDataset,
	apiVersion: config.sanityApiVersion,
	useCdn: true,
	perspective: 'published'
});
