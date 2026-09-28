import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout';
import { TeamsDirectory } from '@/components/teams/TeamsDirectory';
import { getPageMetadata } from '@/lib/content/page';
import { getTeamsDirectory } from '@/lib/content/teams';
import { groupTeamsByTab } from '@/lib/teamService';
import { getCurrentTenant } from '@/tenants/current';

export async function generateMetadata(): Promise<Metadata> {
	const tenant = await getCurrentTenant();
	return getPageMetadata(tenant, 'teamsPage');
}

export default async function FootballTeamsPage() {
	const tenant = await getCurrentTenant();
	const teams = await getTeamsDirectory(tenant);
	const teamsByTab = groupTeamsByTab(teams);

	return (
		<PageContainer tenant={tenant} heading="Football Teams" layout="article">
			<TeamsDirectory teamsByTab={teamsByTab} />
		</PageContainer>
	);
}
