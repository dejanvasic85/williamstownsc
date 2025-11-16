import { config } from 'dotenv';
config({ path: '.env.local' });

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { getConfig } from './src/lib/config';
import { schemaTypes } from './src/sanity/schema/index';
import { structure } from './src/sanity/structure';

const appConfig = getConfig();

export default defineConfig({
	name: 'default',
	title: 'Soccer club website',
	projectId: appConfig.sanityProjectId,
	dataset: appConfig.sanityDataset,
	basePath: '/studio',
	plugins: [structureTool({ structure }), visionTool()],
	schema: {
		types: schemaTypes
	}
});
