import Image from 'next/image';
import Link from 'next/link';
import type { PortableTextBlock } from '@portabletext/types';
import { Calendar, Users } from 'lucide-react';
import { TeamPhotoPlaceholder } from '@/components/teams/TeamPhotoPlaceholder';
import { GradientBackground } from '@/components/ui';
import { homepageTeamsQuery } from '@/lib/content/homepageTeams';
import { client } from '@/sanity/lib/client';
import { getFeaturedPrograms } from '@/sanity/services/programService';

interface HomepageTeam {
	_id: string;
	name: string;
	slug: string;
	photo?: {
		asset: {
			_ref: string;
			url: string;
		};
		alt?: string;
	};
	description: PortableTextBlock[];
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function extractTextFromPortableText(blocks: PortableTextBlock[]): string {
	if (!blocks || blocks.length === 0) return '';

	return blocks
		.map((block) => {
			if (block._type === 'block') {
				const children = block.children || [];
				return children.map((child) => ('text' in child ? child.text : '')).join('');
			}
			return '';
		})
		.join(' ');
}

async function getHomepageTeams(): Promise<HomepageTeam[]> {
	try {
		return await client.fetch<HomepageTeam[]>(homepageTeamsQuery, {}, { next: { tags: ['team'] } });
	} catch (error) {
		console.error('Error fetching homepage teams:', error);
		return [];
	}
}

export async function FootballSection() {
	const [homepageTeams, programs] = await Promise.all([getHomepageTeams(), getFeaturedPrograms(3)]);

	return (
		<GradientBackground className="py-16">
			<div className="container mx-auto px-4">
				<div className="mb-12 text-center">
					<h2 className="mb-4 text-4xl font-bold text-white">Football</h2>
					<p className="mx-auto max-w-2xl text-lg text-white">
						Williamstown SC fields teams across all age groups and genders. Join us and be part of
						our proud football tradition.
					</p>
				</div>

				{/* Teams */}
				{homepageTeams.length > 0 && (
					<div className="mb-12">
						<h3 className="mb-6 text-2xl font-bold text-white">Senior Teams</h3>
						<div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
							{homepageTeams.map((team) => (
								<div
									key={team._id}
									className="card group relative overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl"
								>
									{team.photo?.asset?.url ? (
										<div className="relative h-64 w-full">
											<Image
												src={team.photo.asset.url}
												alt={team.photo.alt || team.name}
												fill
												className="object-cover transition-transform duration-300 group-hover:scale-105"
											/>
											<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />
											<div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
												<h4 className="mb-2 text-2xl font-bold">{team.name}</h4>
												<p className="line-clamp-3 text-sm text-white/90">
													{extractTextFromPortableText(team.description)}
												</p>
											</div>
										</div>
									) : (
										<div className="relative h-64 w-full">
											<TeamPhotoPlaceholder
												name={team.name}
												className="bg-primary/10 absolute inset-0 flex items-center justify-center overflow-hidden"
											/>
											<div className="absolute inset-0 flex flex-col justify-end p-6">
												<h4 className="mb-2 text-2xl font-bold text-white">{team.name}</h4>
												<p className="line-clamp-3 text-sm text-white/90">
													{extractTextFromPortableText(team.description)}
												</p>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
						<div className="flex justify-center md:justify-end">
							<Link href="/football/teams" className="btn btn-secondary">
								View all teams
							</Link>
						</div>
					</div>
				)}

				{/* Programs */}
				{programs.length > 0 && (
					<div className="mb-8">
						<h3 className="mb-6 text-2xl font-bold text-white">Programs</h3>
						<div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{programs.map((program) => (
								<div
									key={program._id}
									className="bg-base-100 group relative overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl"
								>
									{program.imageUrl && (
										<div className="relative h-64 w-full">
											<Image
												src={program.imageUrl}
												alt={program.imageAlt || program.name || 'Program image'}
												fill
												className="object-cover transition-transform duration-300 group-hover:scale-105"
											/>
											<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
											<div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
												<h4 className="mb-2 text-2xl font-bold">{program.name}</h4>
												<div className="flex items-center gap-4 text-sm">
													{program.startDate && program.endDate && (
														<div className="flex items-center gap-1.5">
															<Calendar className="h-4 w-4" />
															<span>
																{formatDate(program.startDate)} - {formatDate(program.endDate)}
															</span>
														</div>
													)}
													{program.minAge !== undefined && program.maxAge !== undefined && (
														<div className="flex items-center gap-1.5">
															<Users className="h-4 w-4" />
															<span>
																Ages {program.minAge}-{program.maxAge}
															</span>
														</div>
													)}
												</div>
												{program.description && (
													<p className="mt-3 line-clamp-2 text-sm text-white/90">
														{extractTextFromPortableText(
															program.description as PortableTextBlock[]
														)}
													</p>
												)}
											</div>
										</div>
									)}
								</div>
							))}
						</div>
						<div className="flex justify-center md:justify-end">
							<Link href="/football/programs" className="btn btn-secondary">
								View all programs
							</Link>
						</div>
					</div>
				)}
			</div>
		</GradientBackground>
	);
}
