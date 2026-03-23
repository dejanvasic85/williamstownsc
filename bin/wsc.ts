#!/usr/bin/env tsx

import { Command } from 'commander';
import { getCrawlableTeams } from '@/lib/content/teams';
import logger from '@/lib/logger';
import { crawlClubs } from './commands/crawlClubs';
import { crawlFixtures } from './commands/crawlFixtures';
import { syncClubs } from './commands/syncClubs';
import { syncFixtures } from './commands/syncFixtures';

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
		'Team slug for output folder (e.g., "state-league-2-men-s-north-west")'
	)
	.option(
		'-l, --league <slug>',
		'League slug for filtering (e.g., "State League 2 Men\'s - North-West")'
	)
	.option('-s, --season <year>', 'Season year', new Date().getFullYear().toString())
	.option('-c, --competition <id>', 'Competition ID', 'FFV')
	.action(
		async (options: { team?: string; league?: string; season?: string; competition?: string }) => {
			if (options.team && options.league) {
				await crawlFixtures({
					team: options.team,
					league: options.league,
					season: options.season,
					competition: options.competition
				});
				return;
			}

			if (options.team || options.league) {
				log.error(
					'both --team and --league must be provided together, or omit both to use Sanity config'
				);
				process.exit(1);
			}

			const teams = await getCrawlableTeams();
			if (teams.length === 0) {
				log.error('no teams with enableFixturesCrawler found in Sanity');
				process.exit(1);
			}

			log.info({ count: teams.length }, 'crawling fixtures for teams from Sanity config');
			const failures: string[] = [];

			for (const team of teams) {
				try {
					const competition = team.competitionName?.trim() || options.competition;
					await crawlFixtures({
						team: team.slug,
						league: team.leagueName,
						season: options.season,
						competition
					});
				} catch {
					// crawlFixtures already logs errors; collect failures for summary
					failures.push(team.slug);
				}
			}

			if (failures.length > 0) {
				log.error({ failures }, 'crawl failed for some teams');
				process.exit(1);
			}
		}
	);

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

program.parse();
