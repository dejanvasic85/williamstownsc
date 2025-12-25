import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { TeamTabs } from '@/components/teams/TeamTabs';
import { getPageMetadata } from '@/lib/content/page';
import { teamsQuery } from '@/lib/content/teams';
import { groupTeamsByTab } from '@/lib/teamService';
import { client } from '@/sanity/lib/client';
import type { Team } from '@/types/team';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('teamsPage');
}

async function getTeams() {
	try {
		const teams = await client.fetch<Team[]>(teamsQuery);
		return teams;
	} catch (error) {
		console.error('Error fetching teams:', error);
		return [];
	}
}

export default async function FootballTeamsPage() {
	const teams = await getTeams();
	const teamsByTab = groupTeamsByTab(teams);

	return (
		<PageContainer heading="Football Teams">
			<TeamTabs teamsByTab={teamsByTab} />
		</PageContainer>
	);
}
