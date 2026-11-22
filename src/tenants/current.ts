import { notFound } from 'next/navigation';
import { tenant as tenantParam } from 'next/root-params';
import { cache } from 'react';
import { getTenantBySlug } from './registry';
import type { Tenant } from './schema/tenantSchema';

/**
 * Resolve the club the current Server Component is rendering, from the `[tenant]` root parameter.
 * Renders 404 when the parameter is missing or unknown. The proxy only rewrites to known clubs,
 * so this guards direct requests for an unregistered slug.
 * Memoised per request so a route's layout, metadata and page share one lookup.
 */
export const getCurrentTenant = cache(async function getCurrentTenant(): Promise<Tenant> {
	const slug = await tenantParam();
	const tenant = slug ? getTenantBySlug(slug) : null;

	if (!tenant) {
		notFound();
	}

	return tenant;
});
