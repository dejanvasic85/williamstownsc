'use client';

import type { TabCategory, TeamsByTab } from '@/types/team';
import { useState } from 'react';
import { TeamListItem } from './TeamListItem';

interface TeamTabsProps {
	teamsByTab: TeamsByTab;
}

const tabLabels: Record<TabCategory, string> = {
	seniors: 'Seniors',
	reserves: 'Reserves',
	juniors: 'Juniors',
	masters: 'Masters',
	metros: 'Metros'
};

const tabOrder: TabCategory[] = ['seniors', 'reserves', 'juniors', 'masters', 'metros'];

export function TeamTabs({ teamsByTab }: TeamTabsProps) {
	const [activeTab, setActiveTab] = useState<TabCategory>('seniors');

	const visibleTabs = tabOrder.filter((tab) => teamsByTab[tab].length > 0);

	if (visibleTabs.length === 0) {
		return (
			<div className="py-16 text-center">
				<p className="text-base-content/60 text-lg">No teams available at the moment.</p>
			</div>
		);
	}

	const activeTeams = teamsByTab[activeTab];

	return (
		<div className="space-y-12">
			<div role="tablist" className="tabs tabs-bordered gap-4">
				{visibleTabs.map((tab) => (
					<button
						key={tab}
						role="tab"
						className={`tab text-lg font-semibold transition-colors ${
							activeTab === tab ? 'tab-active' : ''
						}`}
						onClick={() => setActiveTab(tab)}
						aria-selected={activeTab === tab}
					>
						{tabLabels[tab]}
					</button>
				))}
			</div>

			<div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
				{activeTeams.length > 0 ? (
					<ul className="bg-base-100 rounded-box w-full overflow-hidden">
						{activeTeams.map((team) => (
							<TeamListItem key={team._id} team={team} />
						))}
					</ul>
				) : (
					<div className="py-16 text-center">
						<p className="text-base-content/60 text-lg">
							No {tabLabels[activeTab].toLowerCase()} teams available.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
