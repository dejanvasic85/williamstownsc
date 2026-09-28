import { type SanityClient, createClient } from 'next-sanity';
import { getSanityConfig } from '@/lib/config';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { getTenantSecret } from '@/tenants/secrets/tenantSecrets';

const sanityWriteClientByTenantValue = new Map<string, SanityClient>();

/**
 * Get a server-side Sanity write client for a club, using that club's own write token.
 * Memoised per tenant slug. IMPORTANT: Only use on the server - never expose write token to client
 */
export function getSanityWriteClient(tenant: Tenant): SanityClient {
	const cached = sanityWriteClientByTenantValue.get(tenant.slug);
	if (cached) {
		return cached;
	}

	const { apiVersion } = getSanityConfig();
	const tenantWriteClient = createClient({
		projectId: tenant.sanity.projectId,
		dataset: tenant.sanity.dataset,
		apiVersion,
		useCdn: false, // Must be false for mutations
		token: getTenantSecret('sanityWriteToken', tenant),
		perspective: 'published'
	});

	sanityWriteClientByTenantValue.set(tenant.slug, tenantWriteClient);
	return tenantWriteClient;
}
