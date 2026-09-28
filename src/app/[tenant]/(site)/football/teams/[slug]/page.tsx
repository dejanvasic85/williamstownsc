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
import { resolvePersonPhoto, splitPersonName } from '@/lib/transformers/personTransformer';
import { urlFor } from '@/sanity/lib/image';
import { getCurrentTenant } from '@/tenants/current';

// Next/previous match come from the live matchday API, not the layout's 86400 Sanity content.
export const revalidate = 3600;

const teamHeroImageWidth = 1600;
const teamHeroImageHeight = 900;

type TeamDetailPageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
	const { slug } = await params;
	const tenant = await getCurrentTenant();
	const team = await getTeamBySlug(tenant, slug);
	const siteSettings = await getSiteSettings(tenant);

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
	const tenant = await getCurrentTenant();

	const [team, teamMatches] = await Promise.all([
		getTeamBySlug(tenant, slug),
		getTeamMatches(tenant, slug)
	]);

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
						src={urlFor(tenant.sanity, team.photo)
							.width(teamHeroImageWidth)
							.height(teamHeroImageHeight)
							.fit('crop')
							.url()}
						alt={team.photo.alt || team.name}
						width={teamHeroImageWidth}
						height={teamHeroImageHeight}
						className="aspect-[16/9] w-full rounded-xl object-cover"
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
					<h2 className="text-2xl font-black tracking-wide uppercase">Coaching Staff</h2>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{team.coachingStaff.map((coach) => {
							const { firstName, lastName } = splitPersonName(coach.person.name);
							const photo = resolvePersonPhoto(coach.photo, coach.person.photo);

							return (
								<CoachCard
									key={coach.person._id}
									firstName={firstName}
									lastName={lastName}
									role={coach.title}
									photoUrl={
										photo?.asset
											? urlFor(tenant.sanity, photo).width(512).url()
											: '/img/player-alt.webp'
									}
									photoAlt={photo?.alt || coach.person.name}
								/>
							);
						})}
					</div>
				</div>
			)}

			{team.players && team.players.length > 0 && (
				<div className="mt-8">
					<PlayerGrid players={team.players} sanity={tenant.sanity} />
				</div>
			)}
		</>
	);
}
