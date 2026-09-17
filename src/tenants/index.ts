import 'server-only';
import { createTenantRegistry, normaliseHost } from './registry';
import type { Tenant } from './tenantSchema';
import { williamstown } from './williamstown';

const registryValue = createTenantRegistry([williamstown]);

export function getTenantBySlug(slug: string): Tenant | null {
	return registryValue.getBySlug(slug);
}

export function getTenantByHost(host: string): Tenant | null {
	return registryValue.getByHost(host);
}

export function getAllTenants(): readonly Tenant[] {
	return registryValue.getAll();
}

export { normaliseHost };
