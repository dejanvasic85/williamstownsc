'use client';

import { useEffect } from 'react';

type FixtureAutoScrollProps = {
	currentRound: number;
};

export function FixtureAutoScroll({ currentRound }: FixtureAutoScrollProps) {
	useEffect(() => {
		const el = document.getElementById(`round-${currentRound}`);
		if (!el) return;

		const style = getComputedStyle(document.documentElement);
		const navbarHeight = parseFloat(style.getPropertyValue('--navbar-height-desktop')) * 16;
		const teamNavHeight = parseFloat(style.getPropertyValue('--team-nav-height')) * 16;
		const isDesktop = window.innerWidth >= 1024;
		const offset = isDesktop ? navbarHeight + teamNavHeight + 16 : 0;

		const top = el.getBoundingClientRect().top + window.scrollY - offset;
		window.scrollTo({ top, behavior: 'smooth' });
	}, [currentRound]);

	return null;
}
