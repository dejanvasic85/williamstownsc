import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LeagueTable } from '@/components/teams/LeagueTable';
import { getSiteSettings } from '@/lib/content';
import { getTeamBySlug } from '@/lib/content/teamDetail';
import { getTableForTeam } from '@/lib/matches/tableService';

type TeamTablePageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TeamTablePageProps): Promise<Metadata> {
	const { slug } = await params;
	const [team, siteSettings] = await Promise.all([getTeamBySlug(slug), getSiteSettings()]);

	if (!team) {
		return { title: `Team Not Found | ${siteSettings.clubName}` };
	}

	const tableData = await getTableForTeam(slug);
	const description = tableData
		? `${team.name} league standings in the ${tableData.competition} ${tableData.season} season.`
		: `League table for ${team.name} at ${siteSettings.clubName}.`;

	return {
		title: `${team.name} - League Table | ${siteSettings.clubName}`,
		description,
		openGraph: {
			title: `${team.name} - League Table | ${siteSettings.clubName}`,
			description
		}
	};
}

export default async function TeamTablePage({ params }: TeamTablePageProps) {
	const { slug } = await params;

	const [team, tableData, siteSettings] = await Promise.all([
		getTeamBySlug(slug),
		getTableForTeam(slug),
		getSiteSettings()
	]);

	if (!team || !tableData) {
		notFound();
	}

	return (
		<div className="mx-auto max-w-4xl">
			<h2 className="mt-4 mb-2 text-xl font-bold">League Table</h2>
			<p className="text-base-content/60 mb-6 text-lg">
				{tableData.competition} {tableData.season}
			</p>
			<LeagueTable entries={tableData.entries} wscClubName={siteSettings.clubName ?? ''} />
		</div>
	);
}
