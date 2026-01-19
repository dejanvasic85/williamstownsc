'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';

/**
 * Client component that tracks page views during App Router navigation
 * Sends page_view events to GTM dataLayer when route changes
 *
 * Must be used in a client component as it uses usePathname hook
 */
export function PageViewTracker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (!pathname) return;

		const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

		sendGTMEvent({
			event: 'page_view',
			page_path: url
		});
	}, [pathname, searchParams]);

	return null;
}
