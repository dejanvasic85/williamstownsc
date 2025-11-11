import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineCliConfig({
	api: {
		projectId,
		dataset
	},
	studioHost: 'williamstownsc',
	deployment: {
		autoUpdates: true,
		appId: 'q0zt4f7qoqrj6b19qxgnfu8e'
	}
});
