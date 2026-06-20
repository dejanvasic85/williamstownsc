import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, type Page, chromium } from 'playwright-core';
import { ZodError } from 'zod';
import logger from '@/lib/logger';
import { externalFixturesApiResponseSchema } from '@/types/matches';
import { externalTableApiResponseSchema } from '@/types/table';
import { resolveLeagueIds } from './driblIdResolver';

const log = logger.child({ module: 'crawl-fixtures' });

const driblSiteUrl = 'https://fv.dribl.com/fixtures/';
const driblApiBase = 'https://mc-api.dribl.com/api';
const defaultTimezone = 'Australia/Melbourne';
const maxConsecutiveEmptyRounds = 2;
const maxRounds = 40;

export type CrawlFixturesTeamOptions = {
	team: string;
	league: string;
	season?: string;
	competition?: string;
};

const currentDir = dirname(fileURLToPath(import.meta.url));

type LeagueIds = {
	season: string;
	competition: string;
	league: string;
	tenant: string;
};

function buildApiUrl(endpoint: string, ids: LeagueIds, extra?: Record<string, string>): string {
	const params = new URLSearchParams({
		season: ids.season,
		competition: ids.competition,
		league: ids.league,
		tenant: ids.tenant,
		timezone: defaultTimezone,
		...extra
	});
	return `${driblApiBase}/${endpoint}?${params.toString()}`;
}

async function browserFetch(page: Page, url: string): Promise<unknown> {
	const raw = await page.evaluate(async (u: string) => {
		const r = await fetch(u, { headers: { accept: 'application/json' } });
		if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${u}`);
		return r.text();
	}, url);
	return JSON.parse(raw as string);
}

function clearChunkFiles(dir: string): void {
	mkdirSync(dir, { recursive: true });
	const existing = readdirSync(dir).filter((f) => /^chunk-\d+\.json$/.test(f));
	for (const f of existing) {
		rmSync(resolve(dir, f));
	}
}

async function crawlTeamByRounds(
	page: Page,
	team: string,
	ids: LeagueIds,
	outputDir: string
): Promise<void> {
	clearChunkFiles(outputDir);

	let chunkIndex = 0;
	let emptyStreak = 0;

	for (let round = 1; round <= maxRounds; round++) {
		const url = buildApiUrl('fixtures', ids, { round: String(round) });
		const json = await browserFetch(page, url);
		const validated = externalFixturesApiResponseSchema.parse(json);

		if (validated.data.length === 0) {
			emptyStreak++;
			log.debug({ team, round, emptyStreak }, 'empty round');
			if (emptyStreak >= maxConsecutiveEmptyRounds) {
				log.debug({ team, round }, 'stopping after consecutive empty rounds');
				break;
			}
			continue;
		}

		emptyStreak = 0;
		const chunkPath = resolve(outputDir, `chunk-${chunkIndex}.json`);
		writeFileSync(chunkPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');
		log.debug({ team, round, fixtures: validated.data.length, chunk: chunkIndex }, 'saved round');
		chunkIndex++;
	}

	log.info({ team, chunks: chunkIndex }, 'rounds crawled');
}

async function crawlTeamTable(
	page: Page,
	team: string,
	ids: LeagueIds,
	outputDir: string
): Promise<void> {
	log.debug({ team }, 'fetching ladder');

	const url = buildApiUrl('ladders', ids);
	const json = await browserFetch(page, url);

	let validated;
	try {
		validated = externalTableApiResponseSchema.parse(json);
	} catch (error) {
		log.warn({ team, err: error }, 'ladder response failed validation, skipping');
		return;
	}

	if (validated.data.length === 0) {
		log.warn({ team }, 'no ladder entries, skipping');
		return;
	}

	mkdirSync(outputDir, { recursive: true });
	const outputPath = resolve(outputDir, `${team}.json`);
	writeFileSync(outputPath, JSON.stringify(validated, null, '\t') + '\n', 'utf-8');
	log.debug({ team, entries: validated.data.length, outputPath }, 'table data saved');
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

		// Visit the site once to establish Cloudflare clearance for all subsequent API fetches
		await page.goto(driblSiteUrl, { waitUntil: 'domcontentloaded' });
		await page.waitForTimeout(3000);

		for (const team of teams) {
			try {
				log.info({ team: team.team, league: team.league }, 'crawling team');

				const seasonYear = team.season || new Date().getFullYear().toString();
				const competitionName = team.competition || 'FFV';
				const ids = await resolveLeagueIds(page, team.league, competitionName, seasonYear);

				// Clear stale results chunks — new crawl covers all rounds in fixtures dir
				const resultsOutputDir = resolve(currentDir, `../../data/external/results/${team.team}`);
				clearChunkFiles(resultsOutputDir);

				const fixturesOutputDir = resolve(currentDir, `../../data/external/fixtures/${team.team}`);
				await crawlTeamByRounds(page, team.team, ids, fixturesOutputDir);

				const tableOutputDir = resolve(currentDir, '../../data/external/table');
				await crawlTeamTable(page, team.team, ids, tableOutputDir);

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
