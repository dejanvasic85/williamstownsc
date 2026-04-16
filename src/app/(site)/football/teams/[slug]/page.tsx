import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CoachCard } from '@/components/teams/CoachCard';
import { PlayerGrid } from '@/components/teams/PlayerGrid';
import { TeamMatchesPreview } from '@/components/teams/TeamMatchesPreview';
import { TeamPhotoPlaceholder } from '@/components/teams/TeamPhotoPlaceholder';
import { getSiteSettings } from '@/lib/content';
import { getTeamBySlug } from '@/lib/content/teamDetail';
import { getTeamMatches } from '@/lib/matches/matchService';
import { sanityImageLoader } from '@/lib/sanityImageLoader';
import { splitPersonName } from '@/lib/transformers/personTransformer';
import { urlFor } from '@/sanity/lib/image';

type TeamDetailPageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
	const { slug } = await params;
	const team = await getTeamBySlug(slug);
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

	const [team, teamMatches] = await Promise.all([getTeamBySlug(slug), getTeamMatches(slug)]);

	if (!team) {
		notFound();
	}

	const { hasFixtures: localFixtures, nextMatch, previousMatch } = teamMatches;

	return (
		<>
			<div className="mt-6">
				{team.photo?.asset?.url ? (
					<Image
						loader={sanityImageLoader}
						src={team.photo.asset.url}
						alt={team.photo.alt || team.name}
						width={1200}
						height={600}
						className="h-48 w-full rounded-xl object-cover md:h-96"
						sizes="(max-width: 768px) 100vw, (max-width: 1280px) calc(100vw - 2rem), 1280px"
						priority
					/>
				) : (
					<TeamPhotoPlaceholder name={team.name} />
				)}
			</div>

			{localFixtures && <TeamMatchesPreview nextMatch={nextMatch} previousMatch={previousMatch} />}

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
									photoUrl={
										coach.person.photo?.asset
											? urlFor(coach.person.photo).width(512).url()
											: '/img/player-alt.webp'
									}
									photoAlt={coach.person.photo.alt || coach.person.name}
								/>
							);
						})}
					</div>
				</div>
			)}

			{team.players && team.players.length > 0 && <PlayerGrid players={team.players} />}
		</>
	);
}
