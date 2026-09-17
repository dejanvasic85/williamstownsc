import { type SanityClient, createClient } from 'next-sanity';
import { getClientConfig, getSanityWriteConfig } from '@/lib/config';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { getTenantSecret } from '@/tenants/secrets/tenantSecrets';

let cachedWriteClient: SanityClient | null = null;

/**
 * Get a server-side Sanity client with write permissions.
 * Lazily initializes the client on first use to avoid crashes
 * when SANITY_WRITE_TOKEN is missing on pages that don't need it.
 * IMPORTANT: Only use on the server - never expose write token to client
 */
export function getWriteClient(): SanityClient {
	if (cachedWriteClient) {
		return cachedWriteClient;
	}

	const config = getClientConfig();
	const writeConfig = getSanityWriteConfig();

	cachedWriteClient = createClient({
		projectId: config.sanityProjectId,
		dataset: config.sanityDataset,
		apiVersion: config.sanityApiVersion,
		useCdn: false, // Must be false for mutations
		token: writeConfig.sanityWriteToken,
		perspective: 'published'
	});

	return cachedWriteClient;
}

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

	const config = getClientConfig();
	const tenantWriteClient = createClient({
		projectId: tenant.sanity.projectId,
		dataset: tenant.sanity.dataset,
		apiVersion: config.sanityApiVersion,
		useCdn: false, // Must be false for mutations
		token: getTenantSecret('sanityWriteToken', tenant),
		perspective: 'published'
	});

	sanityWriteClientByTenantValue.set(tenant.slug, tenantWriteClient);
	return tenantWriteClient;
}
