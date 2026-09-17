import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts'],
		setupFiles: ['./src/testEnv.ts']
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'@data': resolve(__dirname, './data'),
			// Marker package: outside a React Server Component build it throws, so tests
			// resolve to the empty variant.
			'server-only': resolve(__dirname, './node_modules/server-only/empty.js')
		}
	}
});
