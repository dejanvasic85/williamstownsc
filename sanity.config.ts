import { config } from 'dotenv';
config({ path: '.env.local' });

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schema/index';
import { structure } from './src/sanity/structure';
import { getConfig } from './src/lib/config';

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
