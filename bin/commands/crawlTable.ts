import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, chromium } from 'playwright-core';
import { ZodError } from 'zod';
import logger from '@/lib/logger';
import { externalTableApiResponseSchema } from '@/types/table';

const log = logger.child({ module: 'crawl-table' });

const driblLaddersApiUrl = 'mc-api.dribl.com/api/ladders';

export type CrawlTableTeamOptions = {
	team: string;
	tableUrl: string;
};

const currentDir = dirname(fileURLToPath(import.meta.url));

function logTeamError(error: unknown, team: string): void {
	if (error instanceof ZodError) {
		log.error({ issues: error.issues, team }, 'crawl failed: validation error');
	} else if (error instanceof Error) {
		log.error({ err: error, team }, 'crawl failed');

		if (error.message.includes("Executable doesn't exist")) {
			log.info('install Playwright browsers with: npx playwright install --with-deps chrome');
		}
	} else {
		log.error({ err: error, team }, 'crawl failed: unknown error');
	}
}

export async function crawlTable(teams: CrawlTableTeamOptions[]): Promise<void> {
	log.info({ count: teams.length }, 'launching browser');
	let browser: Browser | undefined;
	const failures: string[] = [];

	try {
		browser = await chromium.launch({ headless: false, channel: 'chrome' });
		const context = await browser.newContext({
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
			viewport: { width: 1280, height: 720 }
		});
		const page = await context.newPage();

		const outputDir = resolve(currentDir, `../../data/external/table`);
		mkdirSync(outputDir, { recursive: true });

		for (const team of teams) {
			try {
				log.info({ team: team.team, tableUrl: team.tableUrl }, 'crawling table');

				const [response] = await Promise.all([
					page.waitForResponse((r) => r.url().includes(driblLaddersApiUrl) && r.ok(), {
						timeout: 60_000
					}),
					page.goto(team.tableUrl, { waitUntil: 'domcontentloaded' })
				]);

				const rawData = await response.json();
				const validated = externalTableApiResponseSchema.parse(rawData);
				log.debug({ entries: validated.data.length }, 'response validated');

				if (!/^[a-z0-9][a-z0-9-_]*$/i.test(team.team)) {
					throw new Error(`Invalid team slug for filename: ${team.team}`);
				}

				const outputPath = resolve(outputDir, `${team.team}.json`);
				writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');
				log.debug({ outputPath }, 'table data written');

				log.info({ team: team.team }, 'crawl completed');
			} catch (error) {
				logTeamError(error, team.team);
				failures.push(team.team);
			}
		}
	} finally {
		if (browser) {
			await browser.close();
			log.info('browser closed');
		}
	}

	if (failures.length > 0) {
		log.error({ failures }, 'crawl failed for some teams');
		throw new Error(`Crawl failed for teams: ${failures.join(', ')}`);
	}
}
