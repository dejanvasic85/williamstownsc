#!/usr/bin/env tsx

import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Command } from 'commander';
import { type Browser, type Page, type Response, chromium } from 'playwright-core';
import { ZodError } from 'zod';
import { externalFixturesApiResponseSchema } from '@/types/matches';

const fixturesBaseUrl = 'https://fv.dribl.com/fixtures/';
const fixturesApiUrlPrefix = 'https://mc-api.dribl.com/api/fixtures';

type CliArgs = {
	league: string;
	season?: string;
	competition?: string;
};

const program = new Command();

program
	.name('crawl-fixtures')
	.description('Extract fixtures data from Dribl with filtering')
	.version('1.0.0')
	.requiredOption('-l, --league <slug>', 'League slug (e.g., "State League 2 Men\'s - North-West")')
	.option('-s, --season <year>', 'Season year', new Date().getFullYear().toString())
	.option('-c, --competition <id>', 'Competition ID', 'FFV');

program.parse();

async function hasLoadMoreButton(page: Page): Promise<boolean> {
	const button = page.getByRole('button', { name: /load more/i });
	const isVisible = await button.isVisible().catch(() => false);
	if (!isVisible) {
		return false;
	}
	const isEnabled = await button.isEnabled().catch(() => false);
	return isEnabled;
}

async function waitForNewResponse(
	responses: Response[],
	expectedIndex: number,
	timeout: number
): Promise<void> {
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		if (responses.length > expectedIndex) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error(
		`Timeout waiting for response at index ${expectedIndex}. Current responses: ${responses.length}`
	);
}

async function openFilterModal(page: Page): Promise<void> {
	await page.getByRole('button', { name: 'Filter' }).click({ force: true });
	await page.waitForTimeout(1500);
}

async function selectFilterOption(
	page: Page,
	filterName: string,
	optionText: string
): Promise<boolean> {
	try {
		const trimmedFilterName = filterName.trim();
		const trimmedOptionText = optionText.trim();

		// Click filter listitem using page.evaluate() to bypass modal overlay
		const filterClicked = await page.evaluate((name) => {
			const listitems = Array.from(document.querySelectorAll('li'));
			const li = listitems.find((el) => el.textContent?.includes(name));
			if (li) {
				(li as HTMLElement).click();
				return true;
			}
			return false;
		}, trimmedFilterName);

		if (!filterClicked) {
			console.error(`   ❌ Filter "${trimmedFilterName}" not found in modal`);
			return false;
		}

		await page.waitForTimeout(1500);

		// Click option value using page.evaluate() with exact text match
		const optionClicked = await page.evaluate((text) => {
			const elements = Array.from(document.querySelectorAll('*'));
			const option = elements.find((el) => el.textContent?.trim() === text);
			if (option) {
				(option as HTMLElement).click();
				return true;
			}
			return false;
		}, trimmedOptionText);

		if (!optionClicked) {
			console.error(`   ❌ Option "${trimmedOptionText}" not found`);
			return false;
		}

		await page.waitForTimeout(2000);
		return true;
	} catch (error) {
		console.error(`   ❌ Error selecting ${filterName}: ${error}`);
		return false;
	}
}

async function applyFilters(
	page: Page,
	args: CliArgs
): Promise<{ season: string; competition: string; league: string }> {
	console.log('🔧 Applying filters...');

	await page.waitForLoadState('domcontentloaded');
	await page.waitForTimeout(1000);

	// Open the filter modal
	await openFilterModal(page);

	const seasonValue = args.season || new Date().getFullYear().toString();
	const competitionValue = args.competition || 'FFV';

	// Apply Season filter
	console.log(`   🔍 Setting season to: ${seasonValue}`);
	const seasonSuccess = await selectFilterOption(page, 'Season', seasonValue);
	if (seasonSuccess) {
		console.log(`   ✓ Season: ${seasonValue}`);
		await page.waitForLoadState('networkidle');
		await openFilterModal(page); // Reopen modal for next filter
	} else {
		console.log(`   ⚠️  Season filter failed, using default`);
	}

	// Apply Competition filter
	console.log(`   🔍 Setting competition to: ${competitionValue}`);
	const competitionSuccess = await selectFilterOption(page, 'Competition', competitionValue);
	if (competitionSuccess) {
		console.log(`   ✓ Competition: ${competitionValue}`);
		await page.waitForLoadState('networkidle');
		await openFilterModal(page); // Reopen modal for next filter
	} else {
		console.log(`   ⚠️  Competition filter failed, using default`);
	}

	// Apply League filter - this is required
	console.log(`   🔍 Setting league to: ${args.league}`);
	const leagueSuccess = await selectFilterOption(page, 'League', args.league);
	if (leagueSuccess) {
		console.log(`   ✓ League: ${args.league}`);
		await page.waitForLoadState('networkidle');
	} else {
		throw new Error(`Failed to select league "${args.league}". Please check the league name.`);
	}

	return {
		season: seasonValue,
		competition: competitionValue,
		league: args.league
	};
}

async function crawlFixtures() {
	const { league, season, competition } = program.opts<CliArgs>();

	console.log('🚀 Launching browser...');
	let browser: Browser | undefined;

	try {
		browser = await chromium.launch({ headless: false, channel: 'chrome' });
		const context = await browser.newContext({
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
			viewport: { width: 1280, height: 720 }
		});
		const page = await context.newPage();

		// Set up persistent response listener
		const responses: Response[] = [];
		page.on('response', async (response) => {
			if (response.url().startsWith(fixturesApiUrlPrefix) && response.ok()) {
				responses.push(response);
				console.log(`📥 API response captured (${responses.length})`);
			}
		});

		console.log(`🌐 Navigating to: ${fixturesBaseUrl}`);
		await page.goto(fixturesBaseUrl, { waitUntil: 'domcontentloaded' });

		// Apply filters
		const filterValues = await applyFilters(page, { league, season, competition });

		// Wait for first API response
		console.log('⏳ Waiting for initial fixtures...');
		await waitForNewResponse(responses, 0, 60_000);
		console.log(`   ✓ Initial fixtures loaded`);

		// Pagination loop
		let chunkIndex = 0;
		while (await hasLoadMoreButton(page)) {
			const expectedIndex = chunkIndex + 1;
			console.log(`🔄 Loading more fixtures (chunk ${expectedIndex})...`);

			await page.getByRole('button', { name: /load more/i }).click();
			await waitForNewResponse(responses, expectedIndex, 60_000);

			console.log(`   ✓ Chunk ${expectedIndex} loaded`);
			chunkIndex++;
		}

		console.log(`\n✅ All fixtures loaded (${responses.length} chunks)`);

		// Validate and save chunks
		const outputDir = resolve(__dirname, `../data/external/${filterValues.league}`);
		mkdirSync(outputDir, { recursive: true });

		console.log(`\n💾 Saving chunks to: ${outputDir}`);

		for (let i = 0; i < responses.length; i++) {
			try {
				const rawData = await responses[i].json();
				const validated = externalFixturesApiResponseSchema.parse(rawData);

				const chunkPath = resolve(outputDir, `chunk-${i}.json`);
				writeFileSync(chunkPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');

				console.log(`📂 Saved chunk-${i}.json (${validated.data.length} fixtures)`);
			} catch (error) {
				if (error instanceof ZodError) {
					console.error(`\n❌ Validation Error in chunk-${i}:`);
					console.error(error.issues);
					throw error;
				}
				throw error;
			}
		}

		console.log(`\n✨ Crawl completed successfully!`);
		console.log(`   Total chunks: ${responses.length}`);
		console.log(`   League: ${filterValues.league}`);
		console.log(`   Season: ${filterValues.season}`);
		console.log(`   Competition: ${filterValues.competition}\n`);
	} catch (error) {
		console.error('\n❌ Crawl failed:');

		if (error instanceof ZodError) {
			console.error('\nValidation Error:');
			console.error(error.issues);
		} else if (error instanceof Error) {
			console.error(error.message);

			if (error.message.includes("Executable doesn't exist")) {
				console.error(
					'\n💡 Tip: Install Playwright browsers with:\n   npx playwright install --with-deps chrome\n'
				);
			}
		} else {
			console.error(error);
		}

		console.log('');
		process.exit(1);
	} finally {
		if (browser) {
			await browser.close();
			console.log('🔒 Browser closed');
		}
	}
}

crawlFixtures().catch((error) => {
	console.error(`\nUnexpected error: ${error instanceof Error ? error.message : error}`);
	process.exit(1);
});
