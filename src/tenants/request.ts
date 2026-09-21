import { headers } from 'next/headers';
import { getTenantFromHeader } from './registry';
import type { Tenant } from './schema/tenantSchema';

/**
 * Read the club a Route Handler or Server Action is serving, from the x-tenant header
 * the proxy set. Returns null when the header is missing or unknown; callers return 400.
 */
export async function getTenantFromHeaders(): Promise<Tenant | null> {
	const headerValue = (await headers()).get('x-tenant');
	return getTenantFromHeader(headerValue);
}
