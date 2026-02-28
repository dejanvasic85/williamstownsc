import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, type Page, type Response, chromium } from 'playwright-core';
import { ZodError } from 'zod';
import logger from '@/lib/logger';
import { externalFixturesApiResponseSchema } from '@/types/matches';

const log = logger.child({ module: 'crawl-fixtures' });

const fixturesBaseUrl = 'https://fv.dribl.com/fixtures/';
const fixturesApiUrlPrefix = 'https://mc-api.dribl.com/api/fixtures';

export type CrawlFixturesOptions = {
	team: string;
	league: string;
	season?: string;
	competition?: string;
};

const currentDir = dirname(fileURLToPath(import.meta.url));

type FilterArgs = {
	league: string;
	season?: string;
	competition?: string;
};

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
		const seasonButton = elements.find((el) => {
			const text = el.textContent?.trim() || '';
			return /^Season\s+\d{4}$/.test(text) && (el as HTMLElement).offsetParent !== null;
		});
		if (seasonButton) {
			return seasonButton.textContent?.trim() || 'Season';
		}

		const labelEl = elements.find((el) => {
			const text = el.textContent?.trim() || '';
			return text === 'Season' && (el as HTMLElement).offsetParent !== null;
		});

		if (labelEl) {
			const containers: Element[] = [];
			let current: Element | null = labelEl.parentElement;
			for (let i = 0; i < 3 && current; i++) {
				containers.push(current);
				current = current.parentElement;
			}

			for (const container of containers) {
				const texts = Array.from(container.querySelectorAll('*'))
					.filter((el) => (el as HTMLElement).offsetParent !== null)
					.map((el) => el.textContent?.trim() || '')
					.filter((text) => text && text !== 'Season');

				const yearText = texts.find((text) => /^\d{4}$/.test(text));
				if (yearText) {
					return yearText;
				}

				const allSeasonsText = texts.find((text) => /all seasons/i.test(text));
				if (allSeasonsText) {
					return allSeasonsText;
				}
			}
		}

		return 'Season';
	});
	return seasonText;
}

async function waitForLoadMoreButton(page: Page, maxAttempts: number = 10): Promise<boolean> {
	log.info('scrolling to find Load More button');

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		// Scroll to bottom
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(300);

		// Check if button is visible
		const hasButton = await hasLoadMoreButton(page);
		if (hasButton) {
			log.info({ scrollAttempts: attempt }, 'Load More button found');
			return true;
		}

		log.debug({ attempt, maxAttempts }, 'button not visible yet');
	}

	log.info('Load More button not found after scrolling');
	return false;
}

async function clickFilterByText(
	page: Page,
	filterLabel: string,
	currentValueText: string,
	newValueText: string
): Promise<boolean> {
	try {
		log.info({ filter: filterLabel, current: currentValueText }, 'clicking filter');

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
			log.warn({ filter: filterLabel, text: currentValueText }, 'could not find visible text');

			log.info({ filter: filterLabel }, 'falling back to label click');
			const labelClicked = await page.evaluate((labelText) => {
				const elements = Array.from(document.querySelectorAll('*'));
				const element = elements.find((el) => {
					const elementText = el.textContent?.trim() || '';
					return elementText === labelText && (el as HTMLElement).offsetParent !== null;
				});

				if (element) {
					(element as HTMLElement).click();
					return true;
				}
				return false;
			}, filterLabel);

			if (!labelClicked) {
				log.error({ filter: filterLabel }, 'could not find filter label');
				return false;
			}
		}

		// STEP 2: Wait for filter options to appear
		await page.waitForTimeout(1000);

		// STEP 3: Click on the desired option text
		log.info({ filter: filterLabel, value: newValueText }, 'selecting filter option');
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
			log.error({ filter: filterLabel, value: newValueText }, 'could not find option text');
			return false;
		}

		// STEP 4: Wait for filter to apply
		await page.waitForTimeout(1500);
		log.info({ filter: filterLabel, value: newValueText }, 'filter applied');

		return true;
	} catch (error) {
		log.error({ err: error, filter: filterLabel }, 'error setting filter');
		return false;
	}
}

async function applyFilters(
	page: Page,
	args: FilterArgs
): Promise<{ season: string; competition: string; league: string }> {
	log.info('applying filters');

	await page.waitForLoadState('domcontentloaded');
	await page.waitForFunction(
		() => {
			const elements = Array.from(document.querySelectorAll('*'));
			return elements.some((el) => {
				const text = el.textContent?.trim() || '';
				return (
					(/Season\s+\d{4}/.test(text) || text === 'Season') &&
					(el as HTMLElement).offsetParent !== null
				);
			});
		},
		null,
		{ timeout: 15_000 }
	);

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
	log.info('waiting for league options to populate');

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

export async function crawlFixtures({ team, league, season, competition }: CrawlFixturesOptions) {
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

		// Set up persistent response listener
		const responses: Response[] = [];
		page.on('response', async (response) => {
			if (response.url().startsWith(fixturesApiUrlPrefix) && response.ok()) {
				responses.push(response);
				log.info({ count: responses.length }, 'API response captured');
			}
		});

		log.info({ url: fixturesBaseUrl }, 'navigating to fixtures page');
		await page.goto(fixturesBaseUrl, { waitUntil: 'domcontentloaded' });

		// Apply filters
		const filterValues = await applyFilters(page, { league, season, competition });

		// Clear any pre-filter responses to avoid saving stale data
		if (responses.length > 1) {
			responses.splice(0, responses.length - 1);
		}

		// Wait for first API response
		log.info('waiting for initial fixtures');
		await waitForNewResponse(responses, 0, 60_000);
		log.info('initial fixtures loaded');

		// Scroll until Load More button appears
		let hasMorePages = await waitForLoadMoreButton(page);

		// Pagination loop
		let chunkIndex = 0;

		while (hasMorePages) {
			const expectedIndex = chunkIndex + 1;
			log.info({ chunk: expectedIndex }, 'loading more fixtures');

			// Click the Load More button (already scrolled into view by waitForLoadMoreButton)
			const loadMoreButton = page.getByText('Load more...');
			await loadMoreButton.click();

			// Wait for new API response
			await waitForNewResponse(responses, expectedIndex, 60_000);
			log.info({ chunk: expectedIndex }, 'chunk loaded');

			// Wait for UI to update
			await page.waitForTimeout(1000);

			// Scroll to find next Load More button
			chunkIndex++;
			hasMorePages = await waitForLoadMoreButton(page, 5);
		}

		log.info({ totalChunks: responses.length }, 'all fixtures loaded');

		// Validate and save chunks
		const outputDir = resolve(currentDir, `../../data/external/fixtures/${team}`);
		mkdirSync(outputDir, { recursive: true });

		log.info({ outputDir }, 'saving chunks');

		for (let i = 0; i < responses.length; i++) {
			try {
				const rawData = await responses[i].json();
				const validated = externalFixturesApiResponseSchema.parse(rawData);

				const chunkPath = resolve(outputDir, `chunk-${i}.json`);
				writeFileSync(chunkPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');

				log.info({ chunk: i, fixtures: validated.data.length }, 'saved chunk');
			} catch (error) {
				if (error instanceof ZodError) {
					log.error({ chunk: i, issues: error.issues }, 'validation error in chunk');
					throw error;
				}
				throw error;
			}
		}

		log.info(
			{
				totalChunks: responses.length,
				team,
				league: filterValues.league,
				season: filterValues.season,
				competition: filterValues.competition
			},
			'crawl completed'
		);
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

		process.exit(1);
	} finally {
		if (browser) {
			await browser.close();
			log.info('browser closed');
		}
	}
}
