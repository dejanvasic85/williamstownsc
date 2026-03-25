import { defineConfig, devices } from '@playwright/test';

const vercelURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || vercelURL || 'http://localhost:3003';

export default defineConfig({
	testDir: './tests',
	globalTimeout: 5 * 60 * 1000,
	timeout: 30 * 1000,
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? 'list' : 'html',
	use: {
		baseURL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: process.env.CI
		? undefined
		: {
				command: 'npm run dev',
				url: 'http://localhost:3003/api/health',
				reuseExistingServer: true,
				timeout: 120 * 1000
			}
});
