import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schema';
import { getConfig } from './src/lib/config';

const config = getConfig();

export default defineConfig({
	name: 'default',
	title: 'Williamstown SC',
	projectId: config.sanityProjectId,
	dataset: config.sanityDataset,
	basePath: '/studio',
	plugins: [structureTool(), visionTool()],
	schema: {
		types: schemaTypes
	}
});
