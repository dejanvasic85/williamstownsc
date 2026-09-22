import { beforeEach, describe, expect, it } from 'vitest';
import type { Tenant } from '../schema/tenantSchema';
import { getOptionalTenantSecret, getTenantSecret } from './tenantSecrets';

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

describe('getOptionalTenantSecret', () => {
	const optionalEnvKey = 'WILLIAMSTOWN_STADLY_ENQUIRY_URL';
	const tenantWithIntake: Tenant = {
		...tenantValue,
		secrets: {
			...tenantValue.secrets,
			enquiryIntakeUrl: { from: 'env', key: optionalEnvKey }
		}
	};

	beforeEach(() => {
		delete process.env[optionalEnvKey];
	});

	it('reads an optional secret when it is set', () => {
		process.env[optionalEnvKey] = 'https://www.stadly.com.au/api/public/enquiries/wf_test';

		expect(getOptionalTenantSecret('enquiryIntakeUrl', tenantWithIntake)).toBe(
			'https://www.stadly.com.au/api/public/enquiries/wf_test'
		);
	});

	it('returns null when the club does not configure it', () => {
		expect(getOptionalTenantSecret('enquiryIntakeUrl', tenantValue)).toBeNull();
	});

	it('returns null when the club configures it but the value is not set', () => {
		expect(getOptionalTenantSecret('enquiryIntakeUrl', tenantWithIntake)).toBeNull();
	});
});
