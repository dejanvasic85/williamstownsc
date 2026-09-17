import { beforeEach, describe, expect, it } from 'vitest';
import type { Tenant } from '../schema/tenantSchema';
import { createTenantRegistry, normaliseHost } from './tenantRegistry';

const tenantConfigValue: Tenant = {
	slug: 'williamstown',
	domains: ['williamstownsc.com'],
	sanity: { projectId: '1ougwkz1', dataset: 'production' },
	secrets: {
		sanityWriteToken: { from: 'env', key: 'WILLIAMSTOWN_SANITY_WRITE_TOKEN' },
		revalidateSecret: { from: 'env', key: 'WILLIAMSTOWN_REVALIDATE_SECRET' }
	},
	theme: {
		light: { primary: '#1a4ba6', secondary: '#c9a900', brand: '#1a4ba6' },
		dark: { primary: 'oklch(72% 0.18 260)', secondary: '#c9a900', brand: '#1a4ba6' }
	}
};

function makeTenant(overrides: Partial<Tenant>): Tenant {
	return { ...tenantConfigValue, ...overrides };
}

const altonaCityValue: Tenant = makeTenant({
	slug: 'altona-city',
	domains: ['altonacity.com', 'www.altonacity.com'],
	secrets: {
		sanityWriteToken: { from: 'env', key: 'ALTONA_CITY_SANITY_WRITE_TOKEN' },
		revalidateSecret: { from: 'env', key: 'ALTONA_CITY_REVALIDATE_SECRET' }
	}
});

beforeEach(() => {
	delete process.env.VERCEL_ENV;
	delete process.env.DEFAULT_TENANT_SLUG;
});

describe('normaliseHost', () => {
	it('lower-cases the host', () => {
		expect(normaliseHost('WILLIAMSTOWNSC.COM')).toBe('williamstownsc.com');
	});

	it('strips the port', () => {
		expect(normaliseHost('localhost:3003')).toBe('localhost');
		expect(normaliseHost('williamstown.localhost:3003')).toBe('williamstown.localhost');
	});

	it('strips a leading www', () => {
		expect(normaliseHost('www.williamstownsc.com')).toBe('williamstownsc.com');
		expect(normaliseHost('www.williamstownsc.com:443')).toBe('williamstownsc.com');
	});

	it('keeps a www in the middle of the host', () => {
		expect(normaliseHost('www.wwwnews.com')).toBe('wwwnews.com');
	});

	it('keeps an IPv6 literal but drops its port', () => {
		expect(normaliseHost('[::1]:3003')).toBe('[::1]');
	});
});

describe('createTenantRegistry', () => {
	it('looks a tenant up by host, ignoring case, port and www', () => {
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(registry.getByHost('www.williamstownsc.com')).toEqual(tenantConfigValue);
		expect(registry.getByHost('WILLIAMSTOWNSC.COM:443')).toEqual(tenantConfigValue);
	});

	it('looks a tenant up by slug', () => {
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(registry.getBySlug('williamstown')).toEqual(tenantConfigValue);
		expect(registry.getBySlug('altona-city')).toBeNull();
	});

	it('returns every tenant', () => {
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(registry.getAll()).toEqual([tenantConfigValue]);
	});

	it('resolves a *.localhost host to the club with that slug outside production', () => {
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(registry.getByHost('williamstown.localhost')).toEqual(tenantConfigValue);
		expect(registry.getByHost('williamstown.localhost:3003')).toEqual(tenantConfigValue);
	});

	it('does not resolve a *.localhost host for an unknown slug', () => {
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(registry.getByHost('altona-city.localhost')).toBeNull();
	});

	it('falls back to the default tenant for an unmatched *.vercel.app host outside production', () => {
		process.env.DEFAULT_TENANT_SLUG = 'williamstown';
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(registry.getByHost('abc123.vercel.app')).toEqual(tenantConfigValue);
	});

	it('fails loudly when the default tenant slug is unknown', () => {
		process.env.DEFAULT_TENANT_SLUG = 'altona-city';
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(() => registry.getByHost('abc123.vercel.app')).toThrow(/altona-city/);
	});

	it('fails loudly when the default tenant slug is not set', () => {
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(() => registry.getByHost('abc123.vercel.app')).toThrow(/DEFAULT_TENANT_SLUG/);
	});

	it('returns null for an unmatched host in production', () => {
		process.env.VERCEL_ENV = 'production';
		const registry = createTenantRegistry([tenantConfigValue]);
		expect(registry.getByHost('abc123.vercel.app')).toBeNull();
		expect(registry.getByHost('williamstown.localhost')).toBeNull();
		expect(registry.getByHost('unknown.example.com')).toBeNull();
	});
});

describe('registry collisions', () => {
	it('resolves separate tenants alongside each other', () => {
		const registry = createTenantRegistry([tenantConfigValue, altonaCityValue]);
		expect(registry.getByHost('www.altonacity.com')).toEqual(altonaCityValue);
	});

	it('rejects two tenants sharing a normalised host', () => {
		const hostThief = makeTenant({
			slug: 'altona-city',
			domains: ['www.williamstownsc.com'],
			secrets: altonaCityValue.secrets
		});
		expect(() => createTenantRegistry([tenantConfigValue, hostThief])).toThrow(
			/Tenants "williamstown" and "altona-city" share the host "williamstownsc\.com"/
		);
	});

	it('rejects two tenants sharing a slug', () => {
		const duplicate = makeTenant({ domains: ['altonacity.com'], secrets: altonaCityValue.secrets });
		expect(() => createTenantRegistry([tenantConfigValue, duplicate])).toThrow(
			/share the slug "williamstown"/
		);
	});

	it('rejects two tenants sharing a secret key', () => {
		const keyThief = makeTenant({
			slug: 'altona-city',
			domains: ['altonacity.com'],
			secrets: {
				...altonaCityValue.secrets,
				sanityWriteToken: { from: 'env', key: 'WILLIAMSTOWN_SANITY_WRITE_TOKEN' }
			}
		});
		expect(() => createTenantRegistry([tenantConfigValue, keyThief])).toThrow(
			/share the secret key "WILLIAMSTOWN_SANITY_WRITE_TOKEN"/
		);
	});
});
