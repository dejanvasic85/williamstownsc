import { describe, expect, it } from 'vitest';
import { defineTenant, tenantSchema } from './tenantSchema';
import type { Tenant } from './tenantSchema';

const validTenantValue: Tenant = {
	slug: 'williamstown',
	domains: ['williamstownsc.com'],
	sanity: { projectId: '1ougwkz1', dataset: 'production' },
	secrets: {
		sanityWriteToken: { from: 'env', key: 'WILLIAMSTOWN_SANITY_WRITE_TOKEN' },
		revalidateSecret: { from: 'env', key: 'WILLIAMSTOWN_REVALIDATE_SECRET' }
	},
	socialPublishing: {
		metaPageAccessToken: { from: 'env', key: 'WILLIAMSTOWN_META_PAGE_ACCESS_TOKEN' },
		metaFacebookPageId: { from: 'env', key: 'WILLIAMSTOWN_META_FACEBOOK_PAGE_ID' },
		metaInstagramAccountId: { from: 'env', key: 'WILLIAMSTOWN_META_INSTAGRAM_ACCOUNT_ID' }
	},
	theme: {
		light: { primary: '#1a4ba6', secondary: '#c9a900', brand: '#1a4ba6' },
		dark: { primary: 'oklch(72% 0.18 260)', secondary: '#c9a900', brand: '#1a4ba6' }
	}
};

describe('tenantSchema', () => {
	it('accepts a valid tenant', () => {
		expect(tenantSchema.parse(validTenantValue)).toEqual(validTenantValue);
	});

	it('accepts a tenant without the optional socialPublishing group', () => {
		const withoutSocialPublishing: Tenant = { ...validTenantValue, socialPublishing: undefined };
		expect(() => tenantSchema.parse(withoutSocialPublishing)).not.toThrow();
	});

	it('rejects a slug with an uppercase letter', () => {
		expect(() => tenantSchema.parse({ ...validTenantValue, slug: 'Williamstown' })).toThrow();
	});

	it('rejects a slug with an underscore', () => {
		expect(() => tenantSchema.parse({ ...validTenantValue, slug: 'william_town' })).toThrow();
	});

	it('rejects a slug with consecutive hyphens', () => {
		expect(() => tenantSchema.parse({ ...validTenantValue, slug: 'william--stown' })).toThrow();
	});

	it('rejects an empty domain list', () => {
		expect(() => tenantSchema.parse({ ...validTenantValue, domains: [] })).toThrow();
	});

	it('rejects a missing required secret', () => {
		const secrets = { sanityWriteToken: validTenantValue.secrets.sanityWriteToken };
		expect(() => tenantSchema.parse({ ...validTenantValue, secrets })).toThrow();
	});

	it('defineTenant parses and returns the tenant', () => {
		expect(defineTenant(validTenantValue)).toEqual(validTenantValue);
		expect(() => defineTenant({ ...validTenantValue, slug: 'BAD' })).toThrow();
	});
});
