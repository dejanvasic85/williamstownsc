import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import { PageContainer } from '@/components/layout';
import { CoachCard } from '@/components/teams/CoachCard';
import { PlayerGrid } from '@/components/teams/PlayerGrid';
import { getSiteSettings } from '@/lib/content';
import { teamDetailQuery } from '@/lib/content/teamDetail';
import { splitPersonName } from '@/lib/transformers/personTransformer';
import { client } from '@/sanity/lib/client';
import type { Team } from '@/types/team';

interface TeamDetailPageProps {
	params: Promise<{ slug: string }>;
}

async function getTeam(slug: string): Promise<Team | null> {
	try {
		const team = await client.fetch<Team>(teamDetailQuery, { slug }, { next: { tags: ['team'] } });
		return team;
	} catch (error) {
		console.error('Error fetching team:', error);
		return null;
	}
}

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
	const { slug } = await params;
	const team = await getTeam(slug);
	const siteSettings = await getSiteSettings();

	if (!team) {
		return {
			title: `Team Not Found | ${siteSettings.clubName}`
		};
	}

	return {
		title: `${team.name} | ${siteSettings.clubName}`,
		description: `Meet the ${team.name} squad, coaching staff, and players at ${siteSettings.clubName}.`,
		openGraph: {
			title: `${team.name} | ${siteSettings.clubName}`,
			description: `Meet the ${team.name} squad, coaching staff, and players at ${siteSettings.clubName}.`,
			images: team.photo?.asset?.url ? [{ url: team.photo.asset.url }] : []
		}
	};
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
	const { slug } = await params;
	const team = await getTeam(slug);

	if (!team) {
		notFound();
	}

	return (
		<PageContainer heading={team.name}>
			{team.description && <PortableTextContent blocks={team.description} />}
			{team.players && team.players.length > 0 && <PlayerGrid players={team.players} />}
			{team.coachingStaff && team.coachingStaff.length > 0 && (
				<div className="mt-10 space-y-8">
					<h2 className="text-3xl font-black uppercase">Coaching Staff</h2>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{team.coachingStaff.map((coach) => {
							const { firstName, lastName } = splitPersonName(coach.person.name);

							return (
								<CoachCard
									key={coach.person._id}
									firstName={firstName}
									lastName={lastName}
									role={coach.title}
									photoUrl={coach.person.photo.asset.url}
									photoAlt={coach.person.photo.alt || coach.person.name}
								/>
							);
						})}
					</div>
				</div>
			)}
		</PageContainer>
	);
}
