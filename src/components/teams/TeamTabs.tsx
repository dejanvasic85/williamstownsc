'use client';

import { useState } from 'react';
import type { TabCategory, TeamsByTab } from '@/types/team';
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
	const visibleTabs = tabOrder.filter((tab) => teamsByTab[tab].length > 0);
	const [activeTab, setActiveTab] = useState<TabCategory>(() => {
		const firstTab = tabOrder.find((tab) => teamsByTab[tab].length > 0);
		return firstTab || 'seniors';
	});

	if (visibleTabs.length === 0) {
		return (
			<div className="py-16 text-center">
				<p className="text-base-content/60 text-lg">No teams available at the moment.</p>
			</div>
		);
	}

	return (
		<div className="space-y-12">
			{/* Mobile select dropdown */}
			<select
				className="select select-bordered w-full md:hidden"
				value={activeTab}
				onChange={(e) => setActiveTab(e.target.value as TabCategory)}
				aria-label="Select team category"
			>
				{visibleTabs.map((tab) => (
					<option key={tab} value={tab}>
						{tabLabels[tab]}
					</option>
				))}
			</select>

			{/* Desktop tabs */}
			<div role="tablist" className="tabs tabs-border hidden gap-2 md:flex">
				{visibleTabs.map((tab) => (
					<button
						key={tab}
						id={`tab-${tab}`}
						role="tab"
						className={`tab text-sm font-semibold transition-colors lg:text-lg ${
							activeTab === tab ? 'tab-active' : ''
						}`}
						onClick={() => setActiveTab(tab)}
						aria-selected={activeTab === tab}
						aria-controls={`tabpanel-${tab}`}
					>
						{tabLabels[tab]}
					</button>
				))}
			</div>

			{visibleTabs.map((tab) => {
				const teams = teamsByTab[tab];
				const isActive = activeTab === tab;

				return (
					<div
						key={tab}
						id={`tabpanel-${tab}`}
						role="tabpanel"
						aria-labelledby={`tab-${tab}`}
						aria-hidden={!isActive}
						className={`transition-opacity duration-300 ${
							isActive ? 'opacity-100' : 'pointer-events-none absolute opacity-0'
						}`}
					>
						{teams.length > 0 ? (
							<ul className="bg-base-100 rounded-box w-full overflow-hidden">
								{teams.map((team) => (
									<TeamListItem key={team._id} team={team} />
								))}
							</ul>
						) : (
							<div className="py-16 text-center">
								<p className="text-base-content/60 text-lg">
									No {tabLabels[tab].toLowerCase()} teams available.
								</p>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
