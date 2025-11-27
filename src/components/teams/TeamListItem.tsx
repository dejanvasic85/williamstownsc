import type { Team } from '@/types/team';
import Image from 'next/image';
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
						{team.description && team.description.length > 0 && (
							<div className="prose text-base-content/80 max-w-none">
								{team.description.map((block, index) => {
									if (block._type === 'block') {
										const children = block.children || [];
										const text = children.map((child) => child.text).join('');

										if (block.style === 'h1') {
											return (
												<h4 key={block._key || index} className="mb-3 text-xl font-bold">
													{text}
												</h4>
											);
										}
										if (block.style === 'h2') {
											return (
												<h5 key={block._key || index} className="mb-2 text-lg font-bold">
													{text}
												</h5>
											);
										}
										if (block.style === 'h3') {
											return (
												<h6 key={block._key || index} className="mb-2 text-base font-bold">
													{text}
												</h6>
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

					{team.players && team.players.length > 0 && (
						<div className="lg:flex lg:justify-end">
							<a
								href={`/football/teams/${team.slug}`}
								className="btn btn-primary btn-outline"
								aria-label={`View ${team.name}`}
							>
								View Team
							</a>
						</div>
					)}
				</div>
			</div>
		</li>
	);
}
