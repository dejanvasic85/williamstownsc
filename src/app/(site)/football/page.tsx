import { PageContainer } from '@/components/layout';
import { Award, Shield, Trophy, Users } from 'lucide-react';

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

export default function FootballPage() {
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

			{categories.map((category) => {
				const categoryTeams = teamsValue.filter((team) => team.category === category);

				return (
					<section key={category} className="mb-12">
						<h2 className="text-secondary mb-6 text-3xl font-bold">{category}</h2>
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
