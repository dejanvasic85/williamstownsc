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
		<div className="space-y-10">
			{activeGroups.map(({ key, label }, groupIndex) => (
				<section
					key={key}
					style={{ animationDelay: `${groupIndex * 80}ms` }}
					className="animate-[fadeSlideIn_0.4s_ease_both]"
				>
					<h2 className="border-secondary mb-1 border-b-2 pb-2 text-2xl font-bold">{label}</h2>
					<ul>
						{teamsByTab[key].map((team) => (
							<li key={team._id} className="border-base-300 border-b last:border-b-0">
								<Link
									href={`/football/teams/${team.slug}`}
									className="group text-base-content hover:text-primary flex items-center justify-between py-3.5 transition-colors duration-200"
								>
									<span className="text-base font-medium lg:text-lg">{team.name}</span>
									<ArrowRight
										className="text-base-content/30 group-hover:text-primary h-4 w-4 shrink-0 transition-all duration-200 group-hover:translate-x-1"
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
