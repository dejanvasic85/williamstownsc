import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	prettier,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'.sanity/**',
		'out/**',
		'build/**',
		'dist/**',
		'next-env.d.ts',
		// Playwright:
		'test-results/**',
		'playwright-report/**',
		'playwright/.cache/**'
	])
]);

export default eslintConfig;
