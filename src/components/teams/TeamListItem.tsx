import { PortableTextContent } from '@/components/content/PortableTextContent';
import type { Team } from '@/types/team';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CoachingStaffAvatars } from './CoachingStaffAvatars';

interface TeamListItemProps {
	team: Team;
}

export function TeamListItem({ team }: TeamListItemProps) {
	return (
		<li className="border-base-300 border-b last:border-b-0">
			<div className="grid grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[500px_1fr]">
				{team.photo && (
					<figure className="relative aspect-video overflow-hidden">
						<Image
							src={team.photo.asset.url}
							alt={team.photo.alt || team.name}
							fill
							className="object-contain"
							sizes="(max-width: 1024px) 100vw, 300px"
						/>
					</figure>
				)}

				<div className="flex flex-col gap-6">
					<div className="space-y-3">
						<h3 className="text-2xl font-bold">{team.name}</h3>
						<PortableTextContent
							blocks={team.description}
							className="prose text-base-content/80 max-w-none"
							headingLevel="section"
						/>
					</div>

					{team.coachingStaff && team.coachingStaff.length > 0 && (
						<CoachingStaffAvatars coaches={team.coachingStaff} />
					)}

					<div className="flex flex-wrap gap-3 lg:justify-end">
						{team.fixturesUrl && (
							<a
								href={team.fixturesUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="btn btn-primary btn-outline"
								aria-label={`View ${team.name} fixtures`}
							>
								Fixtures
								<ExternalLink className="h-4 w-4" aria-hidden="true" />
							</a>
						)}
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
						{team.players && team.players.length > 0 && (
							<Link
								href={`/football/teams/${team.slug}`}
								className="btn btn-primary btn-outline"
								aria-label={`View ${team.name} players`}
							>
								Players
							</Link>
						)}
					</div>
				</div>
			</div>
		</li>
	);
}
