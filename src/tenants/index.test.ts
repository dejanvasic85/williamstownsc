import { beforeEach, describe, expect, it } from 'vitest';
import { getAllTenants, getTenantByHost, getTenantBySlug } from './index';

beforeEach(() => {
	delete process.env.VERCEL_ENV;
	delete process.env.DEFAULT_TENANT_SLUG;
});

describe('the tenant registry', () => {
	it('resolves Williamstown from its production domain', () => {
		expect(getTenantByHost('www.williamstownsc.com')?.slug).toBe('williamstown');
	});

	it('resolves Williamstown from a localhost subdomain', () => {
		expect(getTenantByHost('williamstown.localhost:3003')?.slug).toBe('williamstown');
	});

	it('resolves Williamstown by slug', () => {
		expect(getTenantBySlug('williamstown')?.sanity.projectId).toBe('1ougwkz1');
	});

	it('returns null for an unknown slug', () => {
		expect(getTenantBySlug('altona-city')).toBeNull();
	});

	it('returns null for an unknown host in production', () => {
		process.env.VERCEL_ENV = 'production';
		expect(getTenantByHost('unknown.example.com')).toBeNull();
	});

	it('lists the registered tenants', () => {
		expect(getAllTenants().map((tenant) => tenant.slug)).toEqual(['williamstown']);
	});
});
