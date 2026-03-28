'use client';

import { useEffect } from 'react';

type FixtureAutoScrollProps = {
	currentRound: number;
};

export function FixtureAutoScroll({ currentRound }: FixtureAutoScrollProps) {
	useEffect(() => {
		document
			.getElementById(`round-${currentRound}`)
			?.scrollIntoView({ behavior: 'instant', block: 'start' });
	}, [currentRound]);

	return null;
}
