import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { MatchList } from '@/components/matches/MatchList';
import { getSiteSettings } from '@/lib/content';
import { getTeamBySlug } from '@/lib/content/teamDetail';
import { getFixturesForTeam } from '@/lib/matches/matchService';

type TeamMatchesPageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TeamMatchesPageProps): Promise<Metadata> {
	const { slug } = await params;
	const team = await getTeamBySlug(slug);
	const siteSettings = await getSiteSettings();

	if (!team) {
		return {
			title: `Team Not Found | ${siteSettings.clubName}`
		};
	}

	const fixtureData = await getFixturesForTeam(slug);

	return {
		title: `${team.name} - Matches | ${siteSettings.clubName}`,
		description: fixtureData
			? `View upcoming fixtures and match schedule for ${team.name} in the ${fixtureData.competition} ${fixtureData.season} season.`
			: `View match information for ${team.name} at ${siteSettings.clubName}.`,
		openGraph: {
			title: `${team.name} - Matches | ${siteSettings.clubName}`,
			description: fixtureData
				? `View upcoming fixtures and match schedule for ${team.name} in the ${fixtureData.competition} ${fixtureData.season} season.`
				: `View match information for ${team.name} at ${siteSettings.clubName}.`
		}
	};
}

export default async function TeamMatchesPage({ params }: TeamMatchesPageProps) {
	const { slug } = await params;
	const team = await getTeamBySlug(slug);

	if (!team) {
		notFound();
	}

	const fixtureData = await getFixturesForTeam(slug);

	if (!fixtureData) {
		notFound();
	}

	return (
		<PageContainer
			heading={`${team.name} Fixtures`}
			intro={`${fixtureData.competition} ${fixtureData.season}`}
		>
			<MatchList fixtures={fixtureData.fixtures} />
		</PageContainer>
	);
}
