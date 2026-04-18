import type { Metadata } from 'next';
import * as Sentry from '@sentry/nextjs';
import { PageContainer } from '@/components/layout';
import { TeamsDirectory } from '@/components/teams/TeamsDirectory';
import { getPageMetadata } from '@/lib/content/page';
import { teamsDirectoryQuery } from '@/lib/content/teams';
import logger from '@/lib/logger';
import { groupTeamsByTab } from '@/lib/teamService';
import { client } from '@/sanity/lib/client';
import type { TeamBase } from '@/types/team';

const log = logger.child({ module: 'teams-page' });

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('teamsPage');
}

async function getTeams(): Promise<TeamBase[]> {
	try {
		return await client.fetch<TeamBase[]>(teamsDirectoryQuery, {}, { next: { tags: ['team'] } });
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'error fetching teams');
		return [];
	}
}

export default async function FootballTeamsPage() {
	const teams = await getTeams();
	const teamsByTab = groupTeamsByTab(teams);

	return (
		<PageContainer heading="Football Teams" layout="article">
			<TeamsDirectory teamsByTab={teamsByTab} />
		</PageContainer>
	);
}
