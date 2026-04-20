import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, chromium } from 'playwright-core';
import { ZodError } from 'zod';
import logger from '@/lib/logger';
import { externalTableApiResponseSchema } from '@/types/table';

const log = logger.child({ module: 'crawl-table' });

const driblLaddersApiUrl = 'mc-api.dribl.com/api/ladders';

export type CrawlTableOptions = {
	team: string;
	tableUrl: string;
};

const currentDir = dirname(fileURLToPath(import.meta.url));

export async function crawlTable({ team, tableUrl }: CrawlTableOptions) {
	log.info({ team, tableUrl }, 'launching browser');
	let browser: Browser | undefined;

	try {
		browser = await chromium.launch({ headless: false, channel: 'chrome' });
		const context = await browser.newContext({
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
			viewport: { width: 1280, height: 720 }
		});
		const page = await context.newPage();

		let capturedResponse: unknown = null;

		page.on('response', async (response) => {
			if (response.url().includes(driblLaddersApiUrl) && response.ok()) {
				try {
					capturedResponse = await response.json();
					log.info({ url: response.url() }, 'API response captured');
				} catch (err) {
					log.warn({ err }, 'failed to parse API response body');
				}
			}
		});

		log.info({ url: tableUrl }, 'navigating to ladder page');
		await page.goto(tableUrl, { waitUntil: 'domcontentloaded' });

		const deadline = Date.now() + 60_000;
		while (!capturedResponse && Date.now() < deadline) {
			await page.waitForTimeout(500);
		}

		if (!capturedResponse) {
			throw new Error(`Timed out waiting for API response from ${driblLaddersApiUrl}`);
		}

		const validated = externalTableApiResponseSchema.parse(capturedResponse);
		log.info({ entries: validated.data.length }, 'response validated');

		const outputDir = resolve(currentDir, `../../data/external/table`);
		mkdirSync(outputDir, { recursive: true });

		const outputPath = resolve(outputDir, `${team}.json`);
		writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');
		log.info({ outputPath }, 'table data written');

		log.info({ team }, 'crawl completed');
	} catch (error) {
		if (error instanceof ZodError) {
			log.error({ issues: error.issues }, 'crawl failed: validation error');
		} else if (error instanceof Error) {
			log.error({ err: error }, 'crawl failed');

			if (error.message.includes("Executable doesn't exist")) {
				log.info('install Playwright browsers with: npx playwright install --with-deps chrome');
			}
		} else {
			log.error({ err: error }, 'crawl failed: unknown error');
		}

		throw error;
	} finally {
		if (browser) {
			await browser.close();
			log.info('browser closed');
		}
	}
}
