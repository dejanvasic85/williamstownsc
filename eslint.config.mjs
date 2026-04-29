import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

const dependencyCheckConfigValue = {
	files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
	settings: {
		'import/internal-regex': '^(@/|@data/)',
		'import/resolver': {
			typescript: {
				project: './tsconfig.json'
			}
		}
	},
	rules: {
		'import/no-extraneous-dependencies': [
			'error',
			{
				packageDir: ['.'],
				devDependencies: [
					'bin/**/*.{js,mjs,cjs,ts,tsx}',
					'**/*.test.{js,jsx,ts,tsx}',
					'**/*.spec.{js,jsx,ts,tsx}',
					'**/tests/**/*.{js,jsx,ts,tsx}',
					'playwright.config.ts',
					'eslint.config.mjs',
					'next.config.ts',
					'sanity.config.ts',
					'sanity.cli.ts'
				],
				optionalDependencies: false,
				peerDependencies: false
			}
		]
	}
};

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	prettier,
	dependencyCheckConfigValue,
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
