import { config as loadEnv } from 'dotenv';
import { defineCliConfig } from 'sanity/cli';

loadEnv({ path: '.env.local' });

// The schema is identical for every club, so type generation runs against one reference project.
const referenceProjectValue = {
	projectId: '1ougwkz1',
	dataset: 'production'
};

export default defineCliConfig({
	api: referenceProjectValue,
	studioHost: 'williamstownsc',
	deployment: {
		autoUpdates: true,
		appId: 'q0zt4f7qoqrj6b19qxgnfu8e'
	}
});
