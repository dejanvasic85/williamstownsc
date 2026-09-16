import type { Tenant } from './tenantSchema';

const localHostPattern = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.localhost$/;
const vercelAppSuffix = '.vercel.app';
const defaultTenantSlugEnv = 'DEFAULT_TENANT_SLUG';

export type TenantRegistry = {
	getBySlug: (slug: string) => Tenant | null;
	getByHost: (host: string) => Tenant | null;
	getAll: () => readonly Tenant[];
};

/**
 * Normalise a host for lookup: lower-case, strip the port, strip a leading 'www.'.
 * The proxy uses the same function, so the registry and the proxy agree on host identity.
 */
export function normaliseHost(host: string): string {
	let normalised = host.trim().toLowerCase();

	// IPv6 literal: keep everything up to the closing bracket.
	if (normalised.startsWith('[')) {
		const end = normalised.indexOf(']');
		return end === -1 ? normalised : normalised.slice(0, end + 1);
	}

	const portSeparator = normalised.lastIndexOf(':');
	if (portSeparator !== -1 && /^\d+$/.test(normalised.slice(portSeparator + 1))) {
		normalised = normalised.slice(0, portSeparator);
	}

	return normalised.replace(/^www\./, '');
}

function isProduction(): boolean {
	return process.env.VERCEL_ENV === 'production';
}

function assertNoConflicts(tenants: readonly Tenant[]): void {
	const conflicts: string[] = [];
	const slugOwners = new Map<string, string>();
	const hostOwners = new Map<string, string>();
	const secretKeyOwners = new Map<string, string>();

	for (const tenant of tenants) {
		const slugOwner = slugOwners.get(tenant.slug);
		if (slugOwner) {
			conflicts.push(`Tenants "${slugOwner}" and "${tenant.slug}" share the slug "${tenant.slug}"`);
		}
		slugOwners.set(tenant.slug, tenant.slug);

		for (const domain of tenant.domains) {
			const host = normaliseHost(domain);
			// The www and bare forms of one club's domain normalise to the same host, so a
			// duplicate only conflicts when a different club owns it.
			const hostOwner = hostOwners.get(host);
			if (hostOwner && hostOwner !== tenant.slug) {
				conflicts.push(`Tenants "${hostOwner}" and "${tenant.slug}" share the host "${host}"`);
			}
			hostOwners.set(host, tenant.slug);
		}

		const secretKeys = [
			...Object.values(tenant.secrets),
			...Object.values(tenant.socialPublishing ?? {})
		].map((secret) => secret.key);

		for (const key of secretKeys) {
			const keyOwner = secretKeyOwners.get(key);
			if (keyOwner && keyOwner !== tenant.slug) {
				conflicts.push(`Tenants "${keyOwner}" and "${tenant.slug}" share the secret key "${key}"`);
			}
			secretKeyOwners.set(key, tenant.slug);
		}
	}

	if (conflicts.length > 0) {
		throw new Error(`Invalid tenant registry:\n${conflicts.join('\n')}`);
	}
}

function resolveDefaultTenant(tenantBySlug: Map<string, Tenant>): Tenant {
	const slug = process.env[defaultTenantSlugEnv];
	if (!slug) {
		throw new Error(
			`${defaultTenantSlugEnv} is required for a *.vercel.app host with no matching tenant`
		);
	}
	const tenant = tenantBySlug.get(slug);
	if (!tenant) {
		throw new Error(
			`${defaultTenantSlugEnv} names the unknown tenant "${slug}". Add it to the registry`
		);
	}
	return tenant;
}

export function createTenantRegistry(tenants: readonly Tenant[]): TenantRegistry {
	assertNoConflicts(tenants);

	const tenantBySlug = new Map(tenants.map((tenant) => [tenant.slug, tenant]));
	const tenantByHost = new Map(
		tenants.flatMap((tenant) =>
			tenant.domains.map((domain) => [normaliseHost(domain), tenant] as const)
		)
	);

	return {
		getBySlug: (slug) => tenantBySlug.get(slug) ?? null,

		getByHost: (host) => {
			const normalised = normaliseHost(host);
			const tenant = tenantByHost.get(normalised);
			if (tenant) {
				return tenant;
			}
			// The registry lists production domains only. The rules below resolve the hosts
			// that exist outside production, so they are off when VERCEL_ENV is 'production'.
			if (isProduction()) {
				return null;
			}
			const localMatch = localHostPattern.exec(normalised);
			if (localMatch) {
				return tenantBySlug.get(localMatch[1]) ?? null;
			}
			if (normalised.endsWith(vercelAppSuffix)) {
				return resolveDefaultTenant(tenantBySlug);
			}
			return null;
		},

		getAll: () => tenants
	};
}
