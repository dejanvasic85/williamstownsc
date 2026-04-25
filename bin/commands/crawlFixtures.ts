import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, type Page, type Response, chromium } from 'playwright-core';
import { ZodError } from 'zod';
import logger from '@/lib/logger';
import { externalFixturesApiResponseSchema } from '@/types/matches';
import { externalTableApiResponseSchema } from '@/types/table';

const log = logger.child({ module: 'crawl-fixtures' });

const fixturesBaseUrl = 'https://fv.dribl.com/fixtures/';
const driblApiBaseUrl = 'https://mc-api.dribl.com/api/';
const driblLaddersApiUrl = 'mc-api.dribl.com/api/ladders';

export type CrawlFixturesTeamOptions = {
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

async function hasPageText(page: Page, text: string): Promise<boolean> {
	return page.evaluate((t) => {
		const elements = Array.from(document.querySelectorAll('*'));
		return elements.some(
			(el) => el.textContent?.trim() === t && (el as HTMLElement).offsetParent !== null
		);
	}, text);
}

async function clickNavTab(page: Page, tabText: string): Promise<void> {
	await page.getByText(tabText).first().click();
	await page.waitForLoadState('domcontentloaded');
	await page.waitForTimeout(2000);
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
	log.debug('scrolling to find Load More button');

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		// Scroll to bottom
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(300);

		// Check if button is visible
		const hasButton = await hasLoadMoreButton(page);
		if (hasButton) {
			log.debug({ scrollAttempts: attempt }, 'Load More button found');
			return true;
		}

		log.debug({ attempt, maxAttempts }, 'button not visible yet');
	}

	log.debug('Load More button not found after scrolling');
	return false;
}

async function clickFilterByText(
	page: Page,
	filterLabel: string,
	currentValueText: string,
	newValueText: string
): Promise<boolean> {
	try {
		log.debug({ filter: filterLabel, current: currentValueText }, 'clicking filter');

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

			log.debug({ filter: filterLabel }, 'falling back to label click');
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
		log.debug({ filter: filterLabel, value: newValueText }, 'selecting filter option');
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
		log.debug({ filter: filterLabel, value: newValueText }, 'filter applied');

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
	log.debug('applying filters');

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
	await page.waitForTimeout(2000);

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
	await page.waitForTimeout(2000);

	// Wait longer for League options to populate after Competition change
	log.debug('waiting for league options to populate');

	// Apply League filter (required)
	const leagueSuccess = await clickFilterByText(page, 'League', 'All Leagues', args.league);

	if (!leagueSuccess) {
		throw new Error(`Failed to select league "${args.league}". Please check the league name.`);
	}

	await page.waitForTimeout(2000);

	return {
		season: seasonValue,
		competition: competitionValue,
		league: args.league
	};
}

async function saveResponseChunks(responses: Response[], outputDir: string): Promise<void> {
	mkdirSync(outputDir, { recursive: true });
	log.debug({ outputDir }, 'saving chunks');

	let savedChunks = 0;
	for (let i = 0; i < responses.length; i++) {
		try {
			const rawData = await responses[i].json();
			const validated = externalFixturesApiResponseSchema.parse(rawData);

			const chunkPath = resolve(outputDir, `chunk-${savedChunks}.json`);
			writeFileSync(chunkPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');

			log.debug({ chunk: savedChunks, fixtures: validated.data.length }, 'saved chunk');
			savedChunks++;
		} catch (error) {
			if (error instanceof ZodError) {
				log.debug({ chunk: i, url: responses[i].url() }, 'skipping non-fixture response');
				continue;
			}
			throw error;
		}
	}
}

async function paginateAndSave(
	page: Page,
	responses: Response[],
	outputDir: string
): Promise<void> {
	await waitForNewResponse(responses, 0, 60_000);
	log.debug('initial data loaded');

	let hasMorePages = await waitForLoadMoreButton(page);
	let chunkIndex = 0;

	while (hasMorePages) {
		const expectedIndex = chunkIndex + 1;
		log.debug({ chunk: expectedIndex }, 'loading more');

		const loadMoreButton = page.getByText('Load more...');
		await loadMoreButton.click();

		await waitForNewResponse(responses, expectedIndex, 60_000);
		log.debug({ chunk: expectedIndex }, 'chunk loaded');

		await page.waitForTimeout(1000);

		chunkIndex++;
		hasMorePages = await waitForLoadMoreButton(page, 5);
	}

	log.debug({ totalChunks: responses.length }, 'all data loaded');
	await saveResponseChunks(responses, outputDir);
}

async function crawlTeamFixtures(
	page: Page,
	responses: Response[],
	outputDir: string,
	filterArgs: FilterArgs
): Promise<void> {
	log.debug({ url: fixturesBaseUrl }, 'navigating to fixtures page');
	await page.goto(fixturesBaseUrl, { waitUntil: 'domcontentloaded' });

	await applyFilters(page, filterArgs);

	// Clear any pre-filter responses to avoid saving stale data
	if (responses.length > 1) {
		responses.splice(0, responses.length - 1);
	}

	log.debug('waiting for initial fixtures data');
	await paginateAndSave(page, responses, outputDir);
}

async function waitForResultsOrNoResults(
	page: Page,
	responses: Response[],
	timeout: number
): Promise<'data' | 'no-results'> {
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		if (responses.length > 0) {
			return 'data';
		}
		if (await hasPageText(page, 'No Results')) {
			return 'no-results';
		}
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	// Final check before giving up
	if (await hasPageText(page, 'No Results')) {
		return 'no-results';
	}
	throw new Error('Timeout waiting for results page to load');
}

async function crawlTeamResults(
	page: Page,
	responses: Response[],
	outputDir: string
): Promise<void> {
	log.debug('navigating to results tab');
	await clickNavTab(page, 'Results');

	const outcome = await waitForResultsOrNoResults(page, responses, 15_000);
	if (outcome === 'no-results') {
		log.warn('results page has no results, skipping');
		mkdirSync(outputDir, { recursive: true });
		return;
	}

	log.debug('waiting for initial results data');
	await paginateAndSave(page, responses, outputDir);
}

async function crawlTeamTable(page: Page, team: string, outputDir: string): Promise<void> {
	log.debug('navigating to ladders tab');

	const tableResponses: Response[] = [];
	const listener = (response: Response) => {
		if (response.url().includes(driblLaddersApiUrl) && response.ok()) {
			tableResponses.push(response);
		}
	};
	page.on('response', listener);

	await clickNavTab(page, 'Ladders');

	try {
		const startTime = Date.now();
		while (Date.now() - startTime < 15_000) {
			if (tableResponses.length > 0) break;
			if (await hasPageText(page, 'No Ladders')) {
				log.warn({ team }, 'ladders page has no ladders, skipping');
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 200));
		}

		if (tableResponses.length === 0) {
			if (await hasPageText(page, 'No Ladders')) {
				log.warn({ team }, 'ladders page has no ladders, skipping');
				return;
			}
			throw new Error('Timeout waiting for ladders response');
		}

		const rawData = await tableResponses[0].json();
		const validated = externalTableApiResponseSchema.parse(rawData);

		mkdirSync(outputDir, { recursive: true });
		const outputPath = resolve(outputDir, `${team}.json`);
		writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');
		log.debug({ entries: validated.data.length, outputPath }, 'table data saved');
	} finally {
		page.off('response', listener);
	}
}

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

export async function crawlFixtures(teams: CrawlFixturesTeamOptions[]): Promise<void> {
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

		const responses: Response[] = [];
		page.on('response', async (response) => {
			if (response.url().startsWith(driblApiBaseUrl) && response.ok()) {
				responses.push(response);
				log.debug({ count: responses.length }, 'API response captured');
			}
		});

		for (const team of teams) {
			try {
				log.info({ team: team.team, league: team.league }, 'crawling team');

				const filterArgs: FilterArgs = {
					league: team.league,
					season: team.season,
					competition: team.competition
				};

				// Crawl fixtures (upcoming) — navigates and applies filters
				responses.length = 0;
				const fixturesOutputDir = resolve(currentDir, `../../data/external/fixtures/${team.team}`);
				await crawlTeamFixtures(page, responses, fixturesOutputDir, filterArgs);

				// Crawl results (past + scores) — clicks Results tab, filters already applied
				responses.length = 0;
				const resultsOutputDir = resolve(currentDir, `../../data/external/results/${team.team}`);
				await crawlTeamResults(page, responses, resultsOutputDir);

				// Crawl ladder — clicks Ladders tab, uses separate response listener
				const tableOutputDir = resolve(currentDir, `../../data/external/table`);
				await crawlTeamTable(page, team.team, tableOutputDir);

				responses.length = 0;
				log.info({ team: team.team, league: team.league }, 'crawl completed');
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
