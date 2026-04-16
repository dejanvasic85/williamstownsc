import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { TeamDetailNav } from '@/components/teams/TeamDetailNav';
import { getAnnouncements } from '@/lib/content';
import { getTeamBySlug } from '@/lib/content/teamDetail';
import { getTeamMatches } from '@/lib/matches/matchService';

type TeamDetailLayoutProps = {
	children: ReactNode;
	params: Promise<{ slug: string }>;
};

export default async function TeamDetailLayout({ children, params }: TeamDetailLayoutProps) {
	const { slug } = await params;

	const [team, teamMatches, announcements] = await Promise.all([
		getTeamBySlug(slug),
		getTeamMatches(slug),
		getAnnouncements()
	]);

	if (!team) {
		notFound();
	}

	const hasAnnouncements = announcements.length > 0;

	return (
		<div
			className={clsx(
				'bg-base-100 min-h-screen',
				'py-6 pb-36',
				hasAnnouncements ? 'lg:pt-(--navbar-with-banner-height)' : 'lg:pt-(--navbar-with-offset)'
			)}
		>
			<div className="container mx-auto px-4">
				<div className="mb-6">
					<div className="border-secondary mb-4 flex items-center gap-3 border-b-4 pb-4">
						<h1 className="text-2xl font-bold lg:text-3xl">{team.name}</h1>
					</div>
					{team.description && (
						<div className="text-lg">
							<PortableTextContent blocks={team.description} />
						</div>
					)}
				</div>

				<TeamDetailNav
					teamSlug={slug}
					hasFixtures={teamMatches.hasFixtures}
					fixturesUrl={team.fixturesUrl}
					tableUrl={team.tableUrl}
				/>

				<main className="py-3">{children}</main>
			</div>
		</div>
	);
}
