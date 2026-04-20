'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, LayoutList } from 'lucide-react';

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
	hasTable?: boolean;
	fixturesUrl?: string;
	tableUrl?: string;
};

export function TeamDetailNav({
	teamSlug,
	teamName,
	hasFixtures,
	hasTable,
	fixturesUrl,
	tableUrl
}: TeamDetailNavProps) {
	const pathname = usePathname();
	const basePath = `/football/teams/${teamSlug}`;
	const [isStuck, setIsStuck] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), {
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
			label: 'Matches',
			href: fixturesHref,
			isExternal: isExternalUrl(fixturesHref),
			isVisible: hasFixturesTab,
			matchFn: (p) => p.startsWith(`${basePath}/matches`)
		},
		{
			label: 'Table',
			href: hasTable ? `${basePath}/table` : (tableUrl ?? ''),
			isExternal: !hasTable && isExternalUrl(tableUrl ?? ''),
			isVisible: !!tableUrl,
			matchFn: (p) => p.startsWith(`${basePath}/table`)
		}
	];

	const visibleTabs = tabs.filter((tab) => tab.isVisible);

	return (
		<>
			<div ref={sentinelRef} className="h-px" aria-hidden="true" />
			<nav
				className={`team-detail-nav sticky top-0 z-40 -mx-4 px-4 pt-1 pb-0 transition-colors duration-300 lg:top-[var(--navbar-height-desktop)] lg:mx-0 lg:px-2 ${
					isStuck ? 'bg-base-200 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]' : 'bg-base-100'
				}`}
				aria-label="Team navigation"
			>
				<span
					className={`text-base-content block truncate px-4 text-xs font-bold transition-all duration-300 lg:text-sm ${
						isStuck ? 'mt-2 max-h-6 translate-y-0 opacity-100' : 'max-h-0 -translate-y-1 opacity-0'
					}`}
					aria-hidden={!isStuck}
				>
					{teamName}
				</span>

				<ul className="flex flex-nowrap items-center gap-1 py-2">
					{visibleTabs.map((tab) => {
						const isActive = tab.matchFn(pathname);

						if (tab.isExternal) {
							return (
								<li key={tab.label}>
									<a
										href={tab.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-base-content/70 hover:bg-base-300 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors lg:gap-1.5 lg:px-4 lg:text-base"
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
									className={`flex items-center rounded-full px-3 py-1.5 text-sm font-semibold transition-colors lg:px-4 lg:text-base ${
										isActive
											? 'bg-secondary text-secondary-content'
											: 'text-base-content/70 hover:bg-base-300'
									}`}
								>
									<span className="sm:hidden">{tab.shortLabel ?? tab.label}</span>
									<span className="hidden sm:inline">{tab.label}</span>
								</Link>
							</li>
						);
					})}
					<li className="ml-auto">
						<Link
							href="/football/teams"
							className="text-base-content/70 hover:bg-base-300 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors lg:px-4 lg:text-base"
							aria-label="All teams"
						>
							<LayoutList className="h-4 w-4 shrink-0" aria-hidden="true" />
							<span className="hidden sm:inline">All Teams</span>
						</Link>
					</li>
				</ul>
			</nav>
		</>
	);
}
