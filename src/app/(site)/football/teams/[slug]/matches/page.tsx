import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FixtureAutoScroll } from '@/components/matches/FixtureAutoScroll';
import { MatchList } from '@/components/matches/MatchList';
import { getSiteSettings } from '@/lib/content';
import { getTeamBySlug } from '@/lib/content/teamDetail';
import { getFixturesForTeam } from '@/lib/matches/matchService';
import type { EnrichedFixture } from '@/types/matches';

function findCurrentRound(fixtures: EnrichedFixture[]): number {
	const today = new Date().toISOString().split('T')[0];
	const sorted = [...fixtures].sort((a, b) => a.date.localeCompare(b.date));
	const upcoming = sorted.find((f) => f.date >= today);
	if (upcoming) return upcoming.round;
	return sorted[sorted.length - 1]?.round ?? 1;
}

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

	const currentRound = findCurrentRound(fixtureData.fixtures);

	return (
		<>
			<p className="text-base-content/60 mt-4 mb-6 text-lg">
				{fixtureData.competition} {fixtureData.season}
			</p>
			<FixtureAutoScroll currentRound={currentRound} />
			<MatchList fixtures={fixtureData.fixtures} />
		</>
	);
}
