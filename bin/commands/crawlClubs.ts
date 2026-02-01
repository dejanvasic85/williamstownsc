import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, chromium } from 'playwright-core';
import { externalApiResponseSchema } from '@/types/matches';

export const defaultFixturesUrl =
	'https://fv.dribl.com/fixtures/?date_range=default&season=nPmrj2rmow&timezone=Australia%2FMelbourne';
const clubsApiUrl = 'https://mc-api.dribl.com/api/list/clubs?disable_paging=true';
const currentDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDir, '../../data/external/clubs/clubs.json');

type CrawlClubsOptions = {
	url: string;
};

export async function crawlClubs({ url }: CrawlClubsOptions) {
	console.log('Launching browser...');
	let browser: Browser | undefined;

	try {
		browser = await chromium.launch({ headless: false, channel: 'chrome' });
		const context = await browser.newContext({
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
			viewport: { width: 1280, height: 720 }
		});
		const page = await context.newPage();

		console.log(`Navigating to: ${url}`);
		console.log('Waiting for clubs API response...');
		const [clubsResponse] = await Promise.all([
			page.waitForResponse((response) => response.url().startsWith(clubsApiUrl) && response.ok(), {
				timeout: 60_000
			}),
			page.goto(url, { waitUntil: 'domcontentloaded' })
		]);
		const rawData = await clubsResponse.json();

		console.log('Received clubs API response, validating...');
		const validated = externalApiResponseSchema.parse(rawData);
		console.log(`Validated ${validated.data.length} clubs`);

		mkdirSync(resolve(outputPath, '..'), { recursive: true });
		writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');
		console.log(`\nSaved clubs data to: ${outputPath}`);
	} finally {
		if (browser) {
			await browser.close();
		}
		console.log('Browser closed');
	}
}
