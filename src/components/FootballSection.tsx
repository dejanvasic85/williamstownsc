import { Calendar, Trophy, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TeamCard {
	title: string;
	description: string;
	icon: 'trophy' | 'users';
	coach?: string;
}

interface ProgramCard {
	name: string;
	startDate: string;
	endDate: string;
	minAge: number;
	maxAge: number;
	imageUrl: string;
	imageAlt: string;
	description?: string;
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

const mockProgramsValue: ProgramCard[] = [
	{
		name: 'Summer Program 2025 Girls',
		startDate: '2024-10-10',
		endDate: '2024-12-15',
		minAge: 8,
		maxAge: 11,
		imageUrl: '/img/photo-1574629810360-7efbbe195018.jpeg',
		imageAlt: 'Girls football training session',
		description:
			'Fun and engaging summer football program for young girls to develop skills and make friends'
	}
];

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function FootballSection() {
	return (
		<section className="bg-base-100 py-16">
			<div className="container mx-auto px-4">
				<h2 className="border-secondary mb-12 border-b-4 pb-4 text-4xl font-bold">Football</h2>

				{/* Programs */}
				{mockProgramsValue.length > 0 && (
					<div className="mb-16">
						<h3 className="mb-6 text-2xl font-bold">Programs</h3>
						<div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{mockProgramsValue.map((program) => (
								<div
									key={program.name}
									className="card bg-base-100 group relative overflow-hidden shadow-lg transition-all hover:shadow-xl"
								>
									<div className="relative h-64 w-full">
										<Image
											src={program.imageUrl}
											alt={program.imageAlt}
											fill
											className="object-cover transition-transform duration-300 group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
										<div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
											<h4 className="mb-2 text-2xl font-bold">{program.name}</h4>
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
								</div>
							))}
						</div>
					</div>
				)}

				{/* Teams */}
				<div className="mb-12">
					<h3 className="mb-6 text-2xl font-bold">Teams</h3>
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
									<h4 className="text-xl font-bold">{team.title}</h4>
								</div>
								<p className="text-base-content/70">{team.description}</p>
								{team.coach && <p className="text-base-content/70">Coach: {team.coach}</p>}
							</div>
						))}
					</div>
				</div>

				<div className="text-center">
					<Link href="/football" className="btn btn-ghost btn-lg">
						View all football
					</Link>
				</div>
			</div>
		</section>
	);
}
