import { tenant as tenantParam } from 'next/root-params';
import { getTenantBySlug } from './registry';
import type { Tenant } from './schema/tenantSchema';

/**
 * Resolve the club the current Server Component is rendering, from the `[tenant]` root parameter.
 * Throws when the parameter is missing or unknown. Neither can happen for a rendered site route,
 * because the layout's `generateStaticParams` covers every club and `dynamicParams` is false.
 */
export async function getCurrentTenant(): Promise<Tenant> {
	const slug = await tenantParam();
	const tenant = slug ? getTenantBySlug(slug) : null;

	if (!tenant) {
		throw new Error(`Unknown tenant: ${slug ?? '(missing)'}`);
	}

	return tenant;
}
