'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
	hasFixtures: boolean;
	fixturesUrl?: string;
	tableUrl?: string;
};

export function TeamDetailNav({
	teamSlug,
	hasFixtures,
	fixturesUrl,
	tableUrl
}: TeamDetailNavProps) {
	const pathname = usePathname();
	const basePath = `/football/teams/${teamSlug}`;

	const hasFixturesTab = hasFixtures || !!fixturesUrl;
	const fixturesHref = hasFixtures ? `${basePath}/matches` : (fixturesUrl ?? '');

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
			isExternal: !hasFixtures,
			isVisible: hasFixturesTab,
			matchFn: (p) => p.startsWith(`${basePath}/matches`)
		},
		{
			label: 'Table',
			href: tableUrl ?? '',
			isExternal: true,
			isVisible: !!tableUrl,
			matchFn: () => false
		}
	];

	const visibleTabs = tabs.filter((tab) => tab.isVisible);

	return (
		<nav
			className="bg-base-100/95 sticky top-0 z-40 -mx-4 p-4 backdrop-blur-sm lg:top-[var(--navbar-height-desktop)]"
			aria-label="Team navigation"
		>
			<div role="tablist" className="tabs tabs-border">
				{visibleTabs.map((tab) => {
					const isActive = tab.matchFn(pathname);

					if (tab.isExternal) {
						return (
							<a
								key={tab.label}
								href={tab.href}
								role="tab"
								target="_blank"
								rel="noopener noreferrer"
								className="tab gap-1.5 text-sm font-semibold lg:text-base"
								aria-selected={false}
							>
								{tab.label}
								<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
							</a>
						);
					}

					return (
						<Link
							key={tab.label}
							href={tab.href}
							role="tab"
							className={`tab text-sm font-semibold lg:text-base ${isActive ? 'tab-active' : ''}`}
							aria-selected={isActive}
						>
							{tab.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
