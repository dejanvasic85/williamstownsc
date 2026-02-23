import Image from 'next/image';
import type { Team } from '@/types/team';
import { CoachingStaffAvatars } from './CoachingStaffAvatars';
import { TeamPhotoPlaceholder } from './TeamPhotoPlaceholder';

interface TeamCardProps {
	team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
	return (
		<div className="card bg-base-100 overflow-hidden shadow-md transition-shadow hover:shadow-xl">
			{team.photo?.asset?.url ? (
				<figure className="relative aspect-video overflow-hidden">
					<Image
						src={team.photo.asset.url}
						alt={team.photo.alt || team.name}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</figure>
			) : (
				<TeamPhotoPlaceholder name={team.name} />
			)}

			<div className="card-body gap-8 p-8">
				<div className="space-y-3">
					<h3 className="card-title text-2xl font-bold">{team.name}</h3>

					{team.description && team.description.length > 0 && (
						<div className="prose text-base-content/80 max-w-none">
							{team.description.map((block, index) => {
								if (block._type === 'block') {
									const children = block.children || [];
									const text = children.map((child) => child.text).join('');

									if (block.style === 'h1') {
										return (
											<h1 key={block._key || index} className="mb-4 text-2xl font-bold">
												{text}
											</h1>
										);
									}
									if (block.style === 'h2') {
										return (
											<h2 key={block._key || index} className="mb-3 text-xl font-bold">
												{text}
											</h2>
										);
									}
									if (block.style === 'h3') {
										return (
											<h3 key={block._key || index} className="mb-2 text-lg font-bold">
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

				{team.coachingStaff && team.coachingStaff.length > 0 && (
					<CoachingStaffAvatars coaches={team.coachingStaff} />
				)}
			</div>
		</div>
	);
}
