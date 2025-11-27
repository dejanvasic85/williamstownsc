import { PageContainer } from '@/components/layout';
import { CoachCard } from '@/components/teams/CoachCard';
import { PlayerGrid } from '@/components/teams/PlayerGrid';
import { teamDetailQuery } from '@/lib/content/teamDetail';
import { client } from '@/sanity/lib/client';
import type { Team } from '@/types/team';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface TeamDetailPageProps {
	params: Promise<{ slug: string }>;
}

async function getTeam(slug: string): Promise<Team | null> {
	try {
		const team = await client.fetch<Team>(teamDetailQuery, { slug });
		return team;
	} catch (error) {
		console.error('Error fetching team:', error);
		return null;
	}
}

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
	const { slug } = await params;
	const team = await getTeam(slug);

	if (!team) {
		return {
			title: 'Team Not Found | Williamstown SC'
		};
	}

	return {
		title: `${team.name} | Williamstown SC`,
		description: `Meet the ${team.name} squad, coaching staff, and players at Williamstown SC.`,
		openGraph: {
			title: `${team.name} | Williamstown SC`,
			description: `Meet the ${team.name} squad, coaching staff, and players at Williamstown SC.`,
			images: team.photo ? [{ url: team.photo.asset.url }] : []
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
			<div className="space-y-6">
				{team.description && team.description.length > 0 && (
					<div className="prose max-w-none">
						{team.description.map((block, index) => {
							if (block._type === 'block') {
								const children = block.children || [];
								const text = children.map((child) => child.text).join('');

								if (block.style === 'h1') {
									return (
										<h2 key={block._key || index} className="mb-4 text-2xl font-bold">
											{text}
										</h2>
									);
								}
								if (block.style === 'h2') {
									return (
										<h3 key={block._key || index} className="mb-3 text-xl font-bold">
											{text}
										</h3>
									);
								}

								return (
									<p key={block._key || index} className="mb-3 leading-relaxed">
										{text}
									</p>
								);
							}
							return null;
						})}
					</div>
				)}
			</div>
			{team.players && team.players.length > 0 && <PlayerGrid players={team.players} />}
			{team.coachingStaff && team.coachingStaff.length > 0 && (
				<div className="space-y-8">
					<h2 className="text-3xl font-black uppercase">Coaching Staff</h2>
					<div className="flex flex-col gap-6">
						{team.coachingStaff.map((coach) => {
							const nameParts = coach.person.name.trim().split(' ');
							const firstName = nameParts.slice(0, -1).join(' ');
							const lastName = nameParts[nameParts.length - 1];

							const role =
								coach.title === 'headCoach'
									? 'Head Coach'
									: coach.title === 'assistantCoach'
										? 'Assistant Coach'
										: coach.title === 'goalkeeperCoach'
											? 'Goalkeeper Coach'
											: coach.title === 'teamManager'
												? 'Team Manager'
												: coach.title === 'physio'
													? 'Physio'
													: coach.title;

							return (
								<CoachCard
									key={coach.person._id}
									firstName={firstName}
									lastName={lastName}
									role={role}
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
