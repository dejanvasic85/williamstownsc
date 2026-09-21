'use client';

import { useParams, usePathname } from 'next/navigation';

type TenantParams = {
	tenant?: string;
};

/**
 * The pathname without the tenant prefix the proxy rewrites in. Server rendering and the first
 * client render both see `/williamstown/news`, while a client-side navigation shows `/news`.
 * Stripping the prefix makes the two match, so nav items compare against public hrefs.
 */
export function useActivePathname(): string {
	const pathname = usePathname();
	const { tenant } = useParams<TenantParams>();

	if (!tenant) {
		return pathname;
	}

	const tenantPrefix = `/${tenant}`;

	if (pathname === tenantPrefix) {
		return '/';
	}

	if (pathname.startsWith(`${tenantPrefix}/`)) {
		return pathname.slice(tenantPrefix.length);
	}

	return pathname;
}
