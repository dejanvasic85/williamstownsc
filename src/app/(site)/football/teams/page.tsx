import type { Metadata } from 'next';
import * as Sentry from '@sentry/nextjs';
import { PageContainer } from '@/components/layout';
import { TeamTabs } from '@/components/teams/TeamTabs';
import { getPageMetadata } from '@/lib/content/page';
import { teamsQuery } from '@/lib/content/teams';
import logger from '@/lib/logger';
import { hasFixtures } from '@/lib/matches/matchService';
import { groupTeamsByTab } from '@/lib/teamService';
import { client } from '@/sanity/lib/client';
import type { Team } from '@/types/team';

const log = logger.child({ module: 'teams-page' });

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('teamsPage');
}

async function getTeams() {
	try {
		const teams = await client.fetch<Team[]>(teamsQuery, {}, { next: { tags: ['team'] } });
		return teams;
	} catch (error) {
		Sentry.captureException(error);
		log.error({ err: error }, 'error fetching teams');
		return [];
	}
}

type TeamWithFixturesFlag = Team & { hasLocalFixtures: boolean };

export default async function FootballTeamsPage() {
	const teams = await getTeams();
	const teamsWithFixtures: TeamWithFixturesFlag[] = await Promise.all(
		teams.map(async (team) => ({ ...team, hasLocalFixtures: await hasFixtures(team.slug) }))
	);
	const teamsByTab = groupTeamsByTab<TeamWithFixturesFlag>(teamsWithFixtures);

	return (
		<PageContainer heading="Football Teams">
			<TeamTabs teamsByTab={teamsByTab} />
		</PageContainer>
	);
}
