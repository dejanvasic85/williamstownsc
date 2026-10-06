import type { Tenant } from '@/tenants/schema/tenantSchema';

export function buildTenantCacheTag(tenant: Tenant, tag: string): string {
	return `${tenant.slug}:${tag}`;
}
