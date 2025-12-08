import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { defineCliConfig } from 'sanity/cli';
import { getClientConfig } from './src/lib/config';

const config = getClientConfig();

export default defineCliConfig({
	api: {
		projectId: config.sanityProjectId,
		dataset: config.sanityDataset
	},
	studioHost: 'williamstownsc',
	deployment: {
		autoUpdates: true,
		appId: 'q0zt4f7qoqrj6b19qxgnfu8e'
	}
});
