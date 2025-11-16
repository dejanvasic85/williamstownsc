import { Trophy, Users } from 'lucide-react';
import Link from 'next/link';

interface TeamCard {
	title: string;
	description: string;
	icon: 'trophy' | 'users';
}

const teamCardsValue: TeamCard[] = [
	{
		title: 'Senior Team',
		description: 'Our mens team competes in the State League North West Division 2',
		icon: 'trophy',
		coach: 'John Smith'
	},
	{
		title: "Reserves (Under 21's)",
		description: 'Developing the next generation of talent',
		icon: 'users',
		coach: 'Jane Doe'
	},
	{
		title: "Women's Team",
		description: "Excellence in women's football",
		icon: 'trophy',
		coach: 'Emily Johnson'
	}
];

export function FootballSection() {
	return (
		<section className="bg-base-100 py-16">
			<div className="container mx-auto px-4">
				<h2 className="border-secondary mb-12 border-b-4 pb-4 text-4xl font-bold">Football</h2>
				<div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{teamCardsValue.map((team) => (
						<div
							key={team.title}
							className="group border-base-300 bg-base-100 rounded-lg border-2 p-6 shadow-md transition-all hover:shadow-xl"
						>
							<div className="mb-4 flex items-center gap-3">
								{team.icon === 'trophy' ? (
									<Trophy className="text-secondary h-8 w-8" />
								) : (
									<Users className="text-secondary h-8 w-8" />
								)}
								<h3 className="text-xl font-bold">{team.title}</h3>
							</div>
							<p className="text-base-content/70">{team.description}</p>
							{team.coach && <p className="text-base-content/70">Coach: {team.coach}</p>}
						</div>
					))}
				</div>

				<div className="text-center">
					<Link href="/football" className="btn btn-ghost btn-lg">
						View all football teams
					</Link>
				</div>
			</div>
		</section>
	);
}
