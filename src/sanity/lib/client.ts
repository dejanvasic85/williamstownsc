import { type SanityClient, createClient } from 'next-sanity';
import { getSanityConfig } from '@/lib/config';
import type { Tenant } from '@/tenants/schema/tenantSchema';

const sanityClientByTenantValue = new Map<string, SanityClient>();

/**
 * Get the read client for a club, pointing at that club's own Sanity project.
 * Memoised per tenant slug, so one club never reads another club's project.
 */
export function getSanityClient(tenant: Tenant): SanityClient {
	const cached = sanityClientByTenantValue.get(tenant.slug);
	if (cached) {
		return cached;
	}

	const { apiVersion } = getSanityConfig();
	const tenantClient = createClient({
		projectId: tenant.sanity.projectId,
		dataset: tenant.sanity.dataset,
		apiVersion,
		useCdn: true,
		perspective: 'published'
	});

	sanityClientByTenantValue.set(tenant.slug, tenantClient);
	return tenantClient;
}
