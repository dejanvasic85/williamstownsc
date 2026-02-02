#!/usr/bin/env tsx

import { Command } from 'commander';
import { crawlClubs } from './commands/crawlClubs';
import { crawlFixtures } from './commands/crawlFixtures';
import { syncClubs } from './commands/syncClubs';
import { syncFixtures } from './commands/syncFixtures';

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
	.requiredOption('-t, --team <slug>', 'Team slug for output folder (e.g., "senior-mens")')
	.requiredOption(
		'-l, --league <slug>',
		'League slug for filtering (e.g., "State League 2 Men\'s - North-West")'
	)
	.option('-s, --season <year>', 'Season year', new Date().getFullYear().toString())
	.option('-c, --competition <id>', 'Competition ID', 'FFV')
	.action(
		async (options: { team: string; league: string; season?: string; competition?: string }) => {
			await crawlFixtures({
				team: options.team,
				league: options.league,
				season: options.season,
				competition: options.competition
			});
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
	.requiredOption('-t, --team <slug>', 'Team slug to sync (e.g., "senior-mens")')
	.action(async (options: { team: string }) => {
		await syncFixtures({ team: options.team });
	});

program.parse();
