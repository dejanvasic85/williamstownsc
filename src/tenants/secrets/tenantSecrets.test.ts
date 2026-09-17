import { beforeEach, describe, expect, it } from 'vitest';
import type { Tenant } from '../schema/tenantSchema';
import { getTenantSecret } from './tenantSecrets';

const tenantValue: Tenant = {
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

beforeEach(() => {
	delete process.env.WILLIAMSTOWN_SANITY_WRITE_TOKEN;
});

describe('getTenantSecret', () => {
	it('resolves an env secret through the club manifest', () => {
		process.env.WILLIAMSTOWN_SANITY_WRITE_TOKEN = 'token-value';
		expect(getTenantSecret('sanityWriteToken', tenantValue)).toBe('token-value');
	});

	it('fails naming the club, the secret and the key when the value is missing', () => {
		expect(() => getTenantSecret('sanityWriteToken', tenantValue)).toThrow(
			/Missing secret "sanityWriteToken" for tenant "williamstown"[\s\S]*WILLIAMSTOWN_SANITY_WRITE_TOKEN/
		);
	});

	it('fails when the club does not configure the secret', () => {
		expect(() => getTenantSecret('metaPageAccessToken', tenantValue)).toThrow(
			/Tenant "williamstown" does not configure the secret "metaPageAccessToken"/
		);
	});
});
