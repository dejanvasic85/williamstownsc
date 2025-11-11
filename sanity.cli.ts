import { defineCliConfig } from 'sanity/cli';
import { getConfig } from './src/lib/config';

const config = getConfig();

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
