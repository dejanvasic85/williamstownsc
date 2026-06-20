import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from 'playwright-core';
import { z } from 'zod';
import logger from '@/lib/logger';

const log = logger.child({ module: 'dribl-id-resolver' });

const driblMcApiBase = 'https://mc-api.dribl.com/api';
const driblSiteLink = 'fv.dribl.com';
const driblSiteSlug = 'fv';
const removedLeaguePrefix = '(Removed)';

const currentDir = dirname(fileURLToPath(import.meta.url));
const cacheFilePath = resolve(currentDir, '../../data/external/dribl-ids.json');

type DriblLeagueIds = {
	season: string;
	competition: string;
	league: string;
	tenant: string;
};

type DriblIdsCache = {
	tenant: string;
	leagues: Record<string, DriblLeagueIds>;
};

const tenantResponseSchema = z.object({
	data: z
		.object({
			id: z.string()
		})
		.passthrough()
});

const listItemSchema = z.object({
	id: z.string(),
	name: z.string()
});

const listResponseSchema = z.object({
	data: z.array(listItemSchema)
});

async function browserGet(page: Page, url: string): Promise<unknown> {
	const result = await page.evaluate(async (u: string) => {
		const r = await fetch(u, { headers: { accept: 'application/json' } });
		if (!r.ok) throw new Error(`HTTP ${r.status} for ${u}`);
		return r.text();
	}, url);
	return JSON.parse(result as string);
}

async function resolveTenant(page: Page): Promise<string> {
	const url = `${driblMcApiBase}/tenants?mc_link=${driblSiteLink}&slug=${driblSiteSlug}`;
	const raw = await browserGet(page, url);
	const parsed = tenantResponseSchema.parse(raw);
	return parsed.data.id;
}

async function resolveSeasonId(page: Page, tenant: string, seasonYear: string): Promise<string> {
	const url = `${driblMcApiBase}/list/seasons?disable_paging=true&tenant=${tenant}`;
	const raw = await browserGet(page, url);
	const parsed = listResponseSchema.parse(raw);
	const match = parsed.data.find((s) => s.name === seasonYear);
	if (!match) throw new Error(`Season "${seasonYear}" not found in dribl`);
	return match.id;
}

async function resolveCompetitionId(
	page: Page,
	tenant: string,
	competitionName: string
): Promise<string> {
	const url = `${driblMcApiBase}/list/competitions?disable_paging=true&tenant=${tenant}`;
	const raw = await browserGet(page, url);
	const parsed = listResponseSchema.parse(raw);
	const match = parsed.data.find((c) => c.name === competitionName);
	if (!match) throw new Error(`Competition "${competitionName}" not found in dribl`);
	return match.id;
}

async function resolveLeagueId(
	page: Page,
	tenant: string,
	competitionId: string,
	leagueName: string
): Promise<string> {
	const url = `${driblMcApiBase}/list/leagues?disable_paging=true&tenant=${tenant}&competition=${competitionId}`;
	const raw = await browserGet(page, url);
	const parsed = listResponseSchema.parse(raw);
	const match = parsed.data.find(
		(l) => l.name === leagueName && !l.name.startsWith(removedLeaguePrefix)
	);
	if (!match) {
		const available = parsed.data
			.filter((l) => !l.name.startsWith(removedLeaguePrefix))
			.map((l) => l.name);
		throw new Error(
			`League "${leagueName}" not found. Available: ${available.slice(0, 10).join(', ')}`
		);
	}
	return match.id;
}

function loadCache(): DriblIdsCache {
	if (!existsSync(cacheFilePath)) return { tenant: '', leagues: {} };
	try {
		return JSON.parse(readFileSync(cacheFilePath, 'utf-8')) as DriblIdsCache;
	} catch {
		return { tenant: '', leagues: {} };
	}
}

function saveCache(cache: DriblIdsCache): void {
	mkdirSync(dirname(cacheFilePath), { recursive: true });
	writeFileSync(cacheFilePath, JSON.stringify(cache, null, '\t') + '\n', 'utf-8');
}

export async function resolveLeagueIds(
	page: Page,
	leagueName: string,
	competitionName: string,
	seasonYear: string
): Promise<DriblLeagueIds> {
	const cache = loadCache();

	if (cache.leagues[leagueName]) {
		log.debug({ leagueName }, 'using cached IDs');
		return cache.leagues[leagueName];
	}

	log.info({ leagueName, competitionName, seasonYear }, 'resolving IDs from dribl');

	const tenant = cache.tenant || (await resolveTenant(page));
	const season = await resolveSeasonId(page, tenant, seasonYear);
	const competition = await resolveCompetitionId(page, tenant, competitionName);
	const league = await resolveLeagueId(page, tenant, competition, leagueName);

	const ids: DriblLeagueIds = { season, competition, league, tenant };

	cache.tenant = tenant;
	cache.leagues[leagueName] = ids;
	saveCache(cache);

	log.info({ leagueName, ids }, 'resolved and cached IDs');
	return ids;
}
