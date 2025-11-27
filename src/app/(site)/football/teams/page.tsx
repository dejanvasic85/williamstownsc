import { PageContainer } from '@/components/layout';
import { TeamTabs } from '@/components/teams/TeamTabs';
import { teamsQuery } from '@/lib/sanity/queries/teams';
import { groupTeamsByTab } from '@/lib/sanity/teamService';
import { client } from '@/sanity/lib/client';
import type { Team } from '@/types/team';
import type { Metadata } from 'next';

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
		<PageContainer>
			<div className="space-y-10">
				<h1 className="border-secondary border-b-4 pb-6 text-3xl font-bold lg:text-4xl">
					Football Teams
				</h1>

				<TeamTabs teamsByTab={teamsByTab} />
			</div>
		</PageContainer>
	);
}
