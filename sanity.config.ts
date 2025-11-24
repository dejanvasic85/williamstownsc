import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schema/index';
import { structure } from './src/sanity/structure';

export default defineConfig({
	name: 'default',
	title: 'Williamstown SC Content',
	projectId: '1ougwkz1',
	dataset: 'production',
	basePath: '/studio',
	plugins: [structureTool({ structure }), visionTool()],
	schema: {
		types: schemaTypes
	}
});
