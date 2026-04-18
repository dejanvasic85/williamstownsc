import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { TabCategory, TeamBase, TeamsByTab } from '@/types/team';

type TeamsDirectoryProps = {
	teamsByTab: TeamsByTab<TeamBase>;
};

type GroupConfig = {
	key: TabCategory;
	label: string;
};

const groupConfigs: GroupConfig[] = [
	{ key: 'seniors', label: 'Seniors' },
	{ key: 'reserves', label: 'Reserves' },
	{ key: 'juniors', label: 'Juniors' },
	{ key: 'masters', label: 'Masters' },
	{ key: 'metros', label: 'Metros' }
];

export function TeamsDirectory({ teamsByTab }: TeamsDirectoryProps) {
	const activeGroups = groupConfigs.filter(({ key }) => teamsByTab[key].length > 0);

	return (
		<div className="space-y-6">
			{activeGroups.map(({ key, label }, groupIndex) => (
				<section
					key={key}
					style={{ animationDelay: `${groupIndex * 80}ms` }}
					className="animate-[fadeSlideIn_0.4s_ease_both] overflow-hidden rounded-2xl"
				>
					<div className="bg-secondary/10 border-secondary/30 border-b-4 px-5 py-3">
						<h2 className="text-base font-bold tracking-widest uppercase">{label}</h2>
					</div>
					<ul className="bg-base-200">
						{teamsByTab[key].map((team) => (
							<li key={team._id}>
								<Link
									href={`/football/teams/${team.slug}`}
									className="group text-base-content hover:bg-base-300 flex items-center justify-between px-5 py-4 transition-colors duration-150"
								>
									<span className="text-base font-medium lg:text-lg">{team.name}</span>
									<ArrowRight
										className="text-base-content/20 group-hover:text-secondary h-4 w-4 shrink-0 transition-all duration-200 group-hover:translate-x-1"
										aria-hidden="true"
									/>
								</Link>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
