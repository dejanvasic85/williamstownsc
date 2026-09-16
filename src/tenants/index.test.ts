import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getAllTenants, getTenantByHost, getTenantBySlug } from './index';

const envKeys = ['VERCEL_ENV', 'DEFAULT_TENANT_SLUG'] as const;
let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
	savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
	for (const key of envKeys) {
		delete process.env[key];
	}
});

afterEach(() => {
	for (const key of envKeys) {
		if (savedEnv[key] === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = savedEnv[key];
		}
	}
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
