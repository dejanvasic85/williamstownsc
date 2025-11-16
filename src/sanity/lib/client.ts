import { getConfig } from '@/lib/config';
import { createClient } from 'next-sanity';

const config = getConfig();

export const client = createClient({
	projectId: config.sanityProjectId,
	dataset: config.sanityDataset,
	apiVersion: config.sanityApiVersion,
	useCdn: true,
	perspective: 'published'
});
