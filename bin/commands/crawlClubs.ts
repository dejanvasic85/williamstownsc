import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, chromium } from 'playwright-core';
import logger from '@/lib/logger';
import { externalApiResponseSchema } from '@/types/matches';

const log = logger.child({ module: 'crawl-clubs' });

const fixturesBaseUrl = 'https://fv.dribl.com/fixtures/';
const clubsApiUrl = 'https://mc-api.dribl.com/api/list/clubs?disable_paging=true';
const currentDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDir, '../../data/external/clubs/clubs.json');

export async function crawlClubs() {
	log.info('launching browser');
	let browser: Browser | undefined;

	try {
		browser = await chromium.launch({ headless: false, channel: 'chrome' });
		const context = await browser.newContext({
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
			viewport: { width: 1280, height: 720 }
		});
		const page = await context.newPage();

		log.info({ url: fixturesBaseUrl }, 'navigating to fixtures page');
		log.info('waiting for clubs API response');
		const [clubsResponse] = await Promise.all([
			page.waitForResponse((response) => response.url().startsWith(clubsApiUrl) && response.ok(), {
				timeout: 60_000
			}),
			page.goto(fixturesBaseUrl, { waitUntil: 'domcontentloaded' })
		]);
		const rawData = await clubsResponse.json();

		log.info('received clubs API response, validating');
		const validated = externalApiResponseSchema.parse(rawData);
		log.info({ count: validated.data.length }, 'validated clubs');

		mkdirSync(resolve(outputPath, '..'), { recursive: true });
		writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');
		log.info({ outputPath }, 'saved clubs data');
	} finally {
		if (browser) {
			await browser.close();
		}
		log.info('browser closed');
	}
}
