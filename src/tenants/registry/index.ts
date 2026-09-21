import 'server-only';
import { williamstown } from '../clubs/williamstown';
import type { Tenant } from '../schema/tenantSchema';
import { createTenantRegistry, normaliseHost } from './tenantRegistry';

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

export function getTenantFromHeader(headerValue: string | null | undefined): Tenant | null {
	if (!headerValue) {
		return null;
	}
	return getTenantBySlug(headerValue);
}

export { normaliseHost };
