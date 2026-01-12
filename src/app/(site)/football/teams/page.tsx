import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { TeamTabs } from '@/components/teams/TeamTabs';
import { getPageMetadata } from '@/lib/content/page';
import { teamsQuery } from '@/lib/content/teams';
import { hasFixtures } from '@/lib/matches/matchService';
import { groupTeamsByTab } from '@/lib/teamService';
import { client } from '@/sanity/lib/client';
import type { Team } from '@/types/team';

export async function generateMetadata(): Promise<Metadata> {
	return getPageMetadata('teamsPage');
}

async function getTeams() {
	try {
		const teams = await client.fetch<Team[]>(teamsQuery, {}, { next: { tags: ['team'] } });
		return teams;
	} catch (error) {
		console.error('Error fetching teams:', error);
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
