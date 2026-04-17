'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

type Tab = {
	label: string;
	shortLabel?: string;
	href: string;
	isExternal: boolean;
	isVisible: boolean;
	matchFn: (pathname: string) => boolean;
};

type TeamDetailNavProps = {
	teamSlug: string;
	teamName: string;
	hasFixtures: boolean;
	fixturesUrl?: string;
	tableUrl?: string;
};

export function TeamDetailNav({
	teamSlug,
	teamName,
	hasFixtures,
	fixturesUrl,
	tableUrl
}: TeamDetailNavProps) {
	const pathname = usePathname();
	const basePath = `/football/teams/${teamSlug}`;
	const [showTeamName, setShowTeamName] = useState(false);

	useEffect(() => {
		const sentinel = document.querySelector('[data-team-heading]');
		if (!sentinel) return;

		const observer = new IntersectionObserver(([entry]) => setShowTeamName(!entry.isIntersecting), {
			threshold: 0
		});

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	const hasFixturesTab = hasFixtures || !!fixturesUrl;
	const fixturesHref = hasFixtures ? `${basePath}/matches` : (fixturesUrl ?? '');

	const isExternalUrl = (href: string) => href.startsWith('http://') || href.startsWith('https://');

	const tabs: Tab[] = [
		{
			label: 'Team details',
			shortLabel: 'Details',
			href: basePath,
			isExternal: false,
			isVisible: true,
			matchFn: (p) => p === basePath
		},
		{
			label: 'Fixtures',
			href: fixturesHref,
			isExternal: isExternalUrl(fixturesHref),
			isVisible: hasFixturesTab,
			matchFn: (p) => p.startsWith(`${basePath}/matches`)
		},
		{
			label: 'Table',
			href: tableUrl ?? '',
			isExternal: isExternalUrl(tableUrl ?? ''),
			isVisible: !!tableUrl,
			matchFn: () => false
		}
	];

	const visibleTabs = tabs.filter((tab) => tab.isVisible);

	return (
		<nav
			className="team-detail-nav bg-base-200 border-secondary sticky top-0 z-40 -mx-4 border-b-2 px-4 pt-2 pb-0 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] lg:top-[var(--navbar-height-desktop)]"
			aria-label="Team navigation"
		>
			<div className="relative flex items-center">
				<ul className="tabs tabs-border flex-nowrap">
					{visibleTabs.map((tab) => {
						const isActive = tab.matchFn(pathname);

						if (tab.isExternal) {
							return (
								<li key={tab.label}>
									<a
										href={tab.href}
										target="_blank"
										rel="noopener noreferrer"
										className="tab gap-1 px-3 text-sm font-semibold lg:gap-1.5 lg:px-4 lg:text-base"
									>
										<span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
										<span className="hidden sm:inline">{tab.label}</span>
										<ExternalLink className="h-3 w-3 lg:h-3.5 lg:w-3.5" aria-hidden="true" />
									</a>
								</li>
							);
						}

						return (
							<li key={tab.label}>
								<Link
									href={tab.href}
									aria-current={isActive ? 'page' : undefined}
									className={`tab px-3 text-sm font-semibold lg:px-4 lg:text-base ${isActive ? 'tab-active' : ''}`}
								>
									<span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
									<span className="hidden sm:inline">{tab.label}</span>
								</Link>
							</li>
						);
					})}
				</ul>

				<span
					className={`text-base-content pointer-events-none absolute right-0 max-w-[40%] truncate text-sm font-bold transition-all duration-300 lg:text-base ${
						showTeamName ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
					}`}
					aria-hidden={!showTeamName}
				>
					{teamName}
				</span>
			</div>
		</nav>
	);
}
