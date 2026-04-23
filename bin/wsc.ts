#!/usr/bin/env tsx

import { Command } from 'commander';
import { getCrawlableTeams } from '@/lib/content/teams';
import logger from '@/lib/logger';
import { crawlClubs } from './commands/crawlClubs';
import { crawlFixtures } from './commands/crawlFixtures';
import { crawlTable } from './commands/crawlTable';
import { syncClubs } from './commands/syncClubs';
import { syncFixtures } from './commands/syncFixtures';
import { syncTable } from './commands/syncTable';

const log = logger.child({ module: 'wsc' });

const program = new Command();

program.name('wsc').description('Williamstown SC data tools').version('1.0.0');

const crawl = program.command('crawl').description('Crawl external data sources');
const sync = program.command('sync').description('Sync external data into canonical format');

crawl
	.command('clubs')
	.description('Crawl club data from Dribl fixtures page')
	.action(async () => {
		await crawlClubs();
	});

crawl
	.command('fixtures')
	.description('Extract fixtures data from Dribl with filtering')
	.option(
		'-t, --team <slug>',
		'Team slug (repeatable; omit to crawl all Sanity teams)',
		(val: string, prev: string[]) => [...prev, val],
		[] as string[]
	)
	.option('-l, --league <name>', 'League name for manual mode (requires exactly one --team)')
	.option('-s, --season <year>', 'Season year', new Date().getFullYear().toString())
	.option('-c, --competition <id>', 'Competition ID', 'FFV')
	.action(
		async (options: { team: string[]; league?: string; season?: string; competition?: string }) => {
			const teams = options.team;

			// Manual mode: single team with explicit league
			if (teams.length === 1 && options.league) {
				await crawlFixtures([
					{
						team: teams[0],
						league: options.league,
						season: options.season,
						competition: options.competition
					}
				]);
				return;
			}

			if (teams.length > 1 && options.league) {
				log.error('--league cannot be combined with multiple --team values');
				process.exit(1);
			}

			// Sanity mode: load all crawlable teams, optionally filter by slug
			const sanityTeams = await getCrawlableTeams();
			if (sanityTeams.length === 0) {
				log.error('no teams with enableFixturesCrawler found in Sanity');
				process.exit(1);
			}

			const filtered =
				teams.length > 0 ? sanityTeams.filter((t) => teams.includes(t.slug)) : sanityTeams;

			if (filtered.length === 0) {
				log.error({ slugs: teams }, 'no matching teams found in Sanity config');
				process.exit(1);
			}

			log.info({ count: filtered.length }, 'crawling fixtures for teams from Sanity config');

			await crawlFixtures(
				filtered.map((t) => ({
					team: t.slug,
					league: t.leagueName,
					season: options.season,
					competition: t.competitionName?.trim() || options.competition
				}))
			);
		}
	);

crawl
	.command('table')
	.description('Extract league table data from Dribl')
	.option(
		'-t, --team <slug>',
		'Team slug (repeatable; omit to crawl all Sanity teams with a tableUrl)',
		(val: string, prev: string[]) => [...prev, val],
		[] as string[]
	)
	.option(
		'-u, --table-url <url>',
		'Dribl ladder page URL for manual mode (requires exactly one --team)'
	)
	.action(async (options: { team: string[]; tableUrl?: string }) => {
		const teams = options.team;

		// Manual mode: single team with explicit table URL
		if (teams.length === 1 && options.tableUrl) {
			await crawlTable([{ team: teams[0], tableUrl: options.tableUrl }]);
			return;
		}

		if (teams.length > 1 && options.tableUrl) {
			log.error('--table-url cannot be combined with multiple --team values');
			process.exit(1);
		}

		// Sanity mode: load all teams with tableUrl, optionally filter by slug
		const sanityTeams = await getCrawlableTeams();
		const teamsWithTable = sanityTeams.filter((t) => t.tableUrl);

		if (teamsWithTable.length === 0) {
			log.error('no teams with tableUrl found in Sanity');
			process.exit(1);
		}

		const filtered =
			teams.length > 0 ? teamsWithTable.filter((t) => teams.includes(t.slug)) : teamsWithTable;

		if (filtered.length === 0) {
			log.error({ slugs: teams }, 'no matching teams with tableUrl found in Sanity config');
			process.exit(1);
		}

		log.info({ count: filtered.length }, 'crawling tables for teams from Sanity config');

		await crawlTable(filtered.map((t) => ({ team: t.slug, tableUrl: t.tableUrl! })));
	});

sync
	.command('clubs')
	.description('Transform external club data into canonical format')
	.action(async () => {
		await syncClubs();
	});

sync
	.command('fixtures')
	.description('Transform external fixture chunks into canonical format')
	.option('-t, --team <slug>', 'Team slug to sync (e.g., "state-league-2-men-s-north-west")')
	.action(async (options: { team?: string }) => {
		if (options.team) {
			await syncFixtures({ team: options.team });
			return;
		}

		const teams = await getCrawlableTeams();
		if (teams.length === 0) {
			log.error('no teams with enableFixturesCrawler found in Sanity');
			process.exit(1);
		}

		log.info({ count: teams.length }, 'syncing fixtures for teams from Sanity config');
		const failures: string[] = [];

		for (const team of teams) {
			try {
				log.info({ team: team.slug }, 'syncing team');
				await syncFixtures({ team: team.slug });
			} catch {
				// syncFixtures already logs errors; collect failures for summary
				failures.push(team.slug);
			}
		}

		if (failures.length > 0) {
			log.error({ failures }, 'sync failed for some teams');
			process.exit(1);
		}
	});

sync
	.command('table')
	.description('Transform external table data into canonical format')
	.option('-t, --team <slug>', 'Team slug to sync (e.g., "state-league-2-men-s-north-west")')
	.action(async (options: { team?: string }) => {
		if (options.team) {
			await syncTable({ team: options.team });
			return;
		}

		const teams = await getCrawlableTeams();
		const teamsWithTable = teams.filter((t) => t.tableUrl);

		if (teamsWithTable.length === 0) {
			log.error('no teams with tableUrl found in Sanity');
			process.exit(1);
		}

		log.info({ count: teamsWithTable.length }, 'syncing tables for teams from Sanity config');
		const failures: string[] = [];

		for (const team of teamsWithTable) {
			try {
				log.info({ team: team.slug }, 'syncing team');
				await syncTable({ team: team.slug });
			} catch {
				failures.push(team.slug);
			}
		}

		if (failures.length > 0) {
			log.error({ failures }, 'sync failed for some teams');
			process.exit(1);
		}
	});

program.parse();
