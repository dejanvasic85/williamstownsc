'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

type Tab = {
	label: string;
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
			className="bg-base-100/95 sticky top-0 z-40 -mx-4 px-4 pt-2 pb-0 backdrop-blur-sm lg:top-[var(--navbar-height-desktop)]"
			aria-label="Team navigation"
		>
			<div className="flex items-center justify-between">
				<ul className="tabs tabs-border">
					{visibleTabs.map((tab) => {
						const isActive = tab.matchFn(pathname);

						if (tab.isExternal) {
							return (
								<li key={tab.label}>
									<a
										href={tab.href}
										target="_blank"
										rel="noopener noreferrer"
										className="tab gap-1.5 text-sm font-semibold lg:text-base"
									>
										{tab.label}
										<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
									</a>
								</li>
							);
						}

						return (
							<li key={tab.label}>
								<Link
									href={tab.href}
									aria-current={isActive ? 'page' : undefined}
									className={`tab text-sm font-semibold lg:text-base ${isActive ? 'tab-active' : ''}`}
								>
									{tab.label}
								</Link>
							</li>
						);
					})}
				</ul>

				<span
					className={`text-base-content truncate pl-4 text-sm font-bold transition-all duration-300 lg:text-base ${
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
