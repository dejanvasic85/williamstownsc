'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
		<>
			<div ref={sentinelRef} className="h-px" aria-hidden="true" />
			<nav
				className={`team-detail-nav sticky top-0 z-40 -mx-4 border-b-2 px-4 pt-1 pb-0 transition-colors duration-300 lg:top-[var(--navbar-height-desktop)] ${
					isStuck
						? 'border-secondary bg-base-200 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]'
						: 'bg-base-100 border-transparent'
				}`}
				aria-label="Team navigation"
			>
				<span
					className={`text-base-content block truncate text-xs font-bold transition-all duration-300 lg:text-sm ${
						isStuck ? 'mt-1 max-h-6 translate-y-0 opacity-100' : 'max-h-0 -translate-y-1 opacity-0'
					}`}
					aria-hidden={!isStuck}
				>
					{teamName}
				</span>

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
			</nav>
		</>
	);
}
