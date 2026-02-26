import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PortableTextContent } from '@/components/content/PortableTextContent';
import type { Team } from '@/types/team';
import { CoachingStaffAvatars } from './CoachingStaffAvatars';
import { TeamPhotoPlaceholder } from './TeamPhotoPlaceholder';

interface TeamWithFixtures extends Team {
	hasLocalFixtures?: boolean;
}

interface TeamListItemProps {
	team: TeamWithFixtures;
}

export function TeamListItem({ team }: TeamListItemProps) {
	return (
		<li className="border-base-300 border-b last:border-b-0">
			<div className="grid grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[500px_1fr]">
				{team.photo?.asset?.url ? (
					<figure className="relative aspect-video overflow-hidden">
						<Image
							src={team.photo.asset.url}
							alt={team.photo.alt || team.name}
							fill
							className="object-contain"
							sizes="(max-width: 1024px) 100vw, 300px"
						/>
					</figure>
				) : (
					<TeamPhotoPlaceholder name={team.name} />
				)}

				<div className="flex flex-col gap-6">
					<div className="space-y-3">
						<h3 className="text-2xl font-bold">{team.name}</h3>
						<PortableTextContent
							blocks={team.description ?? []}
							className="prose text-base-content/80 max-w-none"
							headingLevel="section"
						/>
					</div>

					{team.coachingStaff && team.coachingStaff.length > 0 && (
						<CoachingStaffAvatars coaches={team.coachingStaff} />
					)}

					<div className="flex flex-wrap gap-3 lg:justify-end">
						{team.players && team.players.length > 0 && (
							<Link
								href={`/football/teams/${team.slug}`}
								className="btn btn-primary btn-outline"
								aria-label={`View ${team.name} players`}
							>
								Players
							</Link>
						)}

						{(team.hasLocalFixtures || team.fixturesUrl) &&
							(team.hasLocalFixtures ? (
								<Link
									href={`/football/teams/${team.slug}/matches`}
									className="btn btn-primary btn-outline"
									aria-label={`View ${team.name} matches`}
								>
									Matches
								</Link>
							) : (
								<a
									href={team.fixturesUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="btn btn-primary btn-outline"
									aria-label={`View ${team.name} matches`}
								>
									Matches
									<ExternalLink className="h-4 w-4" aria-hidden="true" />
								</a>
							))}
						{team.tableUrl && (
							<a
								href={team.tableUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="btn btn-primary btn-outline"
								aria-label={`View ${team.name} table`}
							>
								Table
								<ExternalLink className="h-4 w-4" aria-hidden="true" />
							</a>
						)}
					</div>
				</div>
			</div>
		</li>
	);
}
