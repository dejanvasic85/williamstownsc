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
	team: string;
	league: string;
	season?: string;
	competition?: string;
};

type FilterArgs = {
	league: string;
	season?: string;
	competition?: string;
};

const program = new Command();

program
	.name('crawl-fixtures')
	.description('Extract fixtures data from Dribl with filtering')
	.version('1.0.0')
	.requiredOption('-t, --team <slug>', 'Team slug for output folder (e.g., "senior-mens")')
	.requiredOption(
		'-l, --league <slug>',
		'League slug for filtering (e.g., "State League 2 Men\'s - North-West")'
	)
	.option('-s, --season <year>', 'Season year', new Date().getFullYear().toString())
	.option('-c, --competition <id>', 'Competition ID', 'FFV');

program.parse();

async function hasLoadMoreButton(page: Page): Promise<boolean> {
	const button = page.getByText('Load more...');
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

async function getCurrentSeasonText(page: Page): Promise<string> {
	const seasonText = await page.evaluate(() => {
		const elements = Array.from(document.querySelectorAll('*'));
		// Look for 4-digit year that's visible
		const yearElement = elements.find((el) => {
			const text = el.textContent?.trim() || '';
			return /^\d{4}$/.test(text) && (el as HTMLElement).offsetParent !== null;
		});
		return yearElement?.textContent?.trim() || new Date().getFullYear().toString();
	});
	return seasonText;
}

async function waitForLoadMoreButton(page: Page, maxAttempts: number = 10): Promise<boolean> {
	console.log('🔍 Scrolling to find Load More button...');

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		// Scroll to bottom
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(300);

		// Check if button is visible
		const hasButton = await hasLoadMoreButton(page);
		if (hasButton) {
			console.log(`   ✓ Load More button found after ${attempt} scroll(s)`);
			return true;
		}

		console.log(`   ⏳ Attempt ${attempt}/${maxAttempts}: Button not visible yet...`);
	}

	console.log('   ℹ️  Load More button not found after scrolling');
	return false;
}

async function clickFilterByText(
	page: Page,
	filterLabel: string,
	currentValueText: string,
	newValueText: string
): Promise<boolean> {
	try {
		console.log(`   🔍 ${filterLabel}: Clicking "${currentValueText}"...`);

		// STEP 1: Click on the current filter value text
		const currentValueClicked = await page.evaluate((text) => {
			const elements = Array.from(document.querySelectorAll('*'));
			const element = elements.find((el) => {
				const elementText = el.textContent?.trim() || '';
				return elementText === text && (el as HTMLElement).offsetParent !== null;
			});

			if (element) {
				(element as HTMLElement).click();
				return true;
			}
			return false;
		}, currentValueText);

		if (!currentValueClicked) {
			console.error(`   ❌ Could not find visible text: "${currentValueText}"`);
			return false;
		}

		// STEP 2: Wait for filter options to appear
		await page.waitForTimeout(1000);

		// STEP 3: Click on the desired option text
		console.log(`   🔍 ${filterLabel}: Clicking "${newValueText}"...`);
		const optionClicked = await page.evaluate((text) => {
			const elements = Array.from(document.querySelectorAll('*'));
			const element = elements.find((el) => {
				const elementText = el.textContent?.trim() || '';
				return elementText === text && (el as HTMLElement).offsetParent !== null;
			});

			if (element) {
				(element as HTMLElement).click();
				return true;
			}
			return false;
		}, newValueText);

		if (!optionClicked) {
			console.error(`   ❌ Could not find visible text: "${newValueText}"`);
			return false;
		}

		// STEP 4: Wait for filter to apply
		await page.waitForTimeout(1500);
		console.log(`   ✓ ${filterLabel}: ${newValueText}`);

		return true;
	} catch (error) {
		console.error(`   ❌ Error setting ${filterLabel}: ${error}`);
		return false;
	}
}

async function applyFilters(
	page: Page,
	args: FilterArgs
): Promise<{ season: string; competition: string; league: string }> {
	console.log('🔧 Applying filters...');

	await page.waitForLoadState('domcontentloaded');

	const seasonValue = args.season || new Date().getFullYear().toString();
	const competitionValue = args.competition || 'FFV';

	// Apply Season filter
	const currentSeasonText = await getCurrentSeasonText(page);
	const seasonApplied = await clickFilterByText(page, 'Season', currentSeasonText, seasonValue);
	if (!seasonApplied) {
		throw new Error(`Failed to select season "${seasonValue}".`);
	}
	await page.waitForLoadState('networkidle');

	// Apply Competition filter
	const competitionApplied = await clickFilterByText(
		page,
		'Competition',
		'All Competitions',
		competitionValue
	);
	if (!competitionApplied) {
		throw new Error(`Failed to select competition "${competitionValue}".`);
	}
	await page.waitForLoadState('networkidle');

	// Wait longer for League options to populate after Competition change
	console.log('   ⏳ Waiting for league options to populate...');

	// Apply League filter (required)
	const leagueSuccess = await clickFilterByText(page, 'League', 'All Leagues', args.league);

	if (!leagueSuccess) {
		throw new Error(`Failed to select league "${args.league}". Please check the league name.`);
	}

	await page.waitForLoadState('networkidle');

	return {
		season: seasonValue,
		competition: competitionValue,
		league: args.league
	};
}

async function crawlFixtures() {
	const { team, league, season, competition } = program.opts<CliArgs>();

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

		// Clear any pre-filter responses to avoid saving stale data
		if (responses.length > 1) {
			responses.splice(0, responses.length - 1);
		}

		// Wait for first API response
		console.log('⏳ Waiting for initial fixtures...');
		await waitForNewResponse(responses, 0, 60_000);
		console.log(`   ✓ Initial fixtures loaded`);

		// Scroll until Load More button appears
		let hasMorePages = await waitForLoadMoreButton(page);

		// Pagination loop
		let chunkIndex = 0;

		while (hasMorePages) {
			const expectedIndex = chunkIndex + 1;
			console.log(`🔄 Loading more fixtures (chunk ${expectedIndex})...`);

			// Click the Load More button (already scrolled into view by waitForLoadMoreButton)
			const loadMoreButton = page.getByText('Load more...');
			await loadMoreButton.click();

			// Wait for new API response
			await waitForNewResponse(responses, expectedIndex, 60_000);
			console.log(`   ✓ Chunk ${expectedIndex} loaded`);

			// Wait for UI to update
			await page.waitForTimeout(1000);

			// Scroll to find next Load More button
			chunkIndex++;
			hasMorePages = await waitForLoadMoreButton(page, 5);
		}

		console.log(`\n✅ All fixtures loaded (${responses.length} chunks)`);

		// Validate and save chunks
		const outputDir = resolve(__dirname, `../data/external/fixtures/${team}`);
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
		console.log(`   Team: ${team}`);
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
