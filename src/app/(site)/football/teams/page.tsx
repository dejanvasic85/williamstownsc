import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { TeamTabs } from '@/components/teams/TeamTabs';
import { teamsQuery } from '@/lib/content/teams';
import { groupTeamsByTab } from '@/lib/teamService';
import { client } from '@/sanity/lib/client';
import type { Team } from '@/types/team';

export const metadata: Metadata = {
	title: 'Football Teams | Williamstown SC',
	description:
		'Discover all our football teams from seniors to juniors, masters, reserves, and metros. Meet our coaching staff and learn about each team.',
	openGraph: {
		title: 'Football Teams | Williamstown SC',
		description:
			'Discover all our football teams from seniors to juniors, masters, reserves, and metros. Meet our coaching staff and learn about each team.'
	}
};

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
