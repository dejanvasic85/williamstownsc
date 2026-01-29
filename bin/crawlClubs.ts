#!/usr/bin/env tsx

import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { chromium } from 'playwright-core';
import { externalApiResponseSchema } from '@/types/matches';

const defaultFixturesUrl =
	'https://fv.dribl.com/fixtures/?date_range=default&season=nPmrj2rmow&timezone=Australia%2FMelbourne';
const clubsApiUrl = 'https://mc-api.dribl.com/api/list/clubs?disable_paging=true';
const outputPath = resolve(__dirname, '../data/external/clubs/clubs.json');

function parseArgs(): { url: string } {
	const args = process.argv.slice(2);
	const urlIndex = args.indexOf('--url');
	const url = urlIndex !== -1 && args[urlIndex + 1] ? args[urlIndex + 1] : defaultFixturesUrl;
	return { url };
}

async function crawlClubs() {
	const { url } = parseArgs();

	console.log('Launching browser...');
	const browser = await chromium.launch({ headless: false, channel: 'chrome' });
	const context = await browser.newContext({
		userAgent:
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
		viewport: { width: 1280, height: 720 }
	});
	const page = await context.newPage();

	try {
		const clubsDataPromise = new Promise<unknown>((promiseResolve, promiseReject) => {
			const timeout = setTimeout(
				() => promiseReject(new Error('Timed out waiting for clubs API response')),
				60_000
			);

			page.on('response', async (response) => {
				const responseUrl = response.url();
				if (responseUrl.startsWith(clubsApiUrl)) {
					clearTimeout(timeout);
					try {
						const json = await response.json();
						promiseResolve(json);
					} catch (err) {
						promiseReject(new Error(`Failed to parse clubs API response: ${err}`));
					}
				}
			});
		});

		console.log(`Navigating to: ${url}`);
		await page.goto(url, { waitUntil: 'domcontentloaded' });

		console.log('Waiting for clubs API response...');
		const rawData = await clubsDataPromise;

		console.log('Received clubs API response, validating...');
		const validated = externalApiResponseSchema.parse(rawData);
		console.log(`Validated ${validated.data.length} clubs`);

		mkdirSync(resolve(outputPath, '..'), { recursive: true });
		writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');
		console.log(`\nSaved clubs data to: ${outputPath}`);
	} finally {
		await browser.close();
		console.log('Browser closed');
	}
}

crawlClubs().catch((error) => {
	console.error(`\nError: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
});
