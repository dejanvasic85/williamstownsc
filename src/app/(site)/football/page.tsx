import { PageContainer } from '@/components/layout';
import { TransformedProgram } from '@/lib/content';
import { Award, Calendar, Shield, Trophy, Users } from 'lucide-react';
import Image from 'next/image';

interface TeamInfo {
	name: string;
	category: string;
	description: string;
	icon: 'trophy' | 'shield' | 'users' | 'award';
}

const teamsValue: TeamInfo[] = [
	{
		name: 'Senior Team',
		category: 'Men',
		description: 'Our premier squad competing at the highest level of football',
		icon: 'trophy'
	},
	{
		name: "Reserves (Under 21's)",
		category: 'Men',
		description: 'Developing the next generation of talent for senior competition',
		icon: 'shield'
	},
	{
		name: "Women's Team",
		category: 'Women',
		description: "Excellence and competitive play in women's football",
		icon: 'trophy'
	},
	{
		name: 'Under 18s',
		category: 'Juniors',
		description: 'Elite development program for aspiring senior players',
		icon: 'users'
	},
	{
		name: 'Under 16s',
		category: 'Juniors',
		description: 'Building skills and teamwork for the next level',
		icon: 'users'
	},
	{
		name: 'Under 14s',
		category: 'Juniors',
		description: 'Foundational development and competitive match experience',
		icon: 'users'
	},
	{
		name: 'Under 12s',
		category: 'Juniors',
		description: 'Introduction to competitive football in a supportive environment',
		icon: 'award'
	},
	{
		name: 'Under 10s',
		category: 'Juniors',
		description: 'Fun-focused football development for young players',
		icon: 'award'
	}
];

const iconComponentMap = {
	trophy: Trophy,
	shield: Shield,
	users: Users,
	award: Award
};

const mockProgramsValue: TransformedProgram[] = [
	{
		_id: '1',
		name: 'Summer Program 2025 Girls',
		slug: 'summer-program-2025-girls',
		startDate: '2024-10-10',
		endDate: '2024-12-15',
		minAge: 8,
		maxAge: 11,
		image: {
			url: '/img/photo-1574629810360-7efbbe195018.jpeg',
			alt: 'Girls football training session'
		},
		description:
			'Fun and engaging summer football program for young girls to develop skills and make friends'
	}
];

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export default async function FootballPage() {
	const programs = mockProgramsValue;
	const categories = ['Men', 'Women', 'Juniors'];

	return (
		<PageContainer>
			<div className="mb-12">
				<h1 className="border-secondary mb-4 border-b-4 pb-4 text-2xl font-bold lg:text-3xl">
					Football
				</h1>
				<p className="text-base-content/70 text-lg">
					Williamstown SC fields teams across all age groups and genders. Join us and be part of our
					proud football tradition.
				</p>
			</div>

			{programs.length > 0 && (
				<section className="mb-16">
					<h2 className="mb-6 text-3xl font-bold">Programs</h2>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{programs.map((program: TransformedProgram) => (
							<div
								key={program._id}
								className="card bg-base-100 group relative overflow-hidden shadow-lg transition-all hover:shadow-xl"
							>
								{program.image?.url && (
									<div className="relative h-64 w-full">
										<Image
											src={program.image.url}
											alt={program.image.alt || program.name}
											fill
											className="object-cover transition-transform duration-300 group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
										<div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
											<h3 className="mb-2 text-2xl font-bold">{program.name}</h3>
											<div className="flex items-center gap-4 text-sm">
												<div className="flex items-center gap-1.5">
													<Calendar className="h-4 w-4" />
													<span>
														{formatDate(program.startDate)} - {formatDate(program.endDate)}
													</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Users className="h-4 w-4" />
													<span>
														Ages {program.minAge}-{program.maxAge}
													</span>
												</div>
											</div>
											{program.description && (
												<p className="mt-3 line-clamp-2 text-sm text-white/90">
													{program.description}
												</p>
											)}
										</div>
									</div>
								)}
								{!program.image?.url && (
									<div className="card-body">
										<h3 className="card-title text-xl">{program.name}</h3>
										<div className="flex flex-col gap-2 text-sm">
											<div className="flex items-center gap-2">
												<Calendar className="text-secondary h-4 w-4" />
												<span>
													{formatDate(program.startDate)} - {formatDate(program.endDate)}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Users className="text-secondary h-4 w-4" />
												<span>
													Ages {program.minAge}-{program.maxAge}
												</span>
											</div>
										</div>
										{program.description && (
											<p className="text-base-content/70 mt-2">{program.description}</p>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				</section>
			)}

			<section className="mb-12">
				<h2 className="mb-6 text-3xl font-bold">Teams</h2>
			</section>

			{categories.map((category) => {
				const categoryTeams = teamsValue.filter((team) => team.category === category);

				return (
					<section key={category} className="mb-12">
						<h3 className="mb-6 text-2xl font-bold">{category}</h3>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{categoryTeams.map((team) => {
								const IconComponent = iconComponentMap[team.icon];

								return (
									<div
										key={team.name}
										className="card bg-base-100 overflow-hidden shadow-lg transition-all hover:shadow-xl"
									>
										<div className="card-body">
											<div className="mb-3 flex items-center gap-3">
												<div className="bg-secondary/10 rounded-full p-3">
													<IconComponent className="text-secondary h-8 w-8" />
												</div>
												<h3 className="card-title text-xl">{team.name}</h3>
											</div>
											<p className="text-base-content/70">{team.description}</p>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				);
			})}

			<div className="bg-primary text-primary-content mt-16 rounded-lg p-8 text-center">
				<h2 className="mb-4 text-3xl font-bold">Interested in Joining?</h2>
				<p className="mb-6 text-lg">
					Whether you&apos;re a player, parent, or supporter, we&apos;d love to hear from you.
				</p>
				<button className="btn btn-secondary btn-lg">Contact Us</button>
			</div>
		</PageContainer>
	);
}
