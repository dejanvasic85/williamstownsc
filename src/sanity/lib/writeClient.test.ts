import { beforeEach, describe, expect, it } from 'vitest';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { getSanityWriteClient } from './writeClient';

function makeTenant(slug: string, projectId: string, tokenKey: string): Tenant {
	return {
		slug,
		domains: [`${slug}.example.com`],
		sanity: { projectId, dataset: 'production' },
		secrets: {
			sanityWriteToken: { from: 'env', key: tokenKey },
			revalidateSecret: { from: 'env', key: `${slug.toUpperCase()}_REVALIDATE_SECRET` }
		},
		theme: {
			light: { primary: '#1a4ba6', secondary: '#c9a900', brand: '#1a4ba6' },
			dark: { primary: 'oklch(72% 0.18 260)', secondary: '#c9a900', brand: '#1a4ba6' }
		}
	};
}

const williamstownValue = makeTenant(
	'williamstown',
	'project-one',
	'WILLIAMSTOWN_SANITY_WRITE_TOKEN'
);
const altonaCityValue = makeTenant('altona-city', 'project-two', 'ALTONA_CITY_SANITY_WRITE_TOKEN');

beforeEach(() => {
	delete process.env.WILLIAMSTOWN_SANITY_WRITE_TOKEN;
	delete process.env.ALTONA_CITY_SANITY_WRITE_TOKEN;
});

describe('getSanityWriteClient', () => {
	it('uses that club write token and project', () => {
		process.env.WILLIAMSTOWN_SANITY_WRITE_TOKEN = 'token-one';
		process.env.ALTONA_CITY_SANITY_WRITE_TOKEN = 'token-two';

		const williamstownClient = getSanityWriteClient(williamstownValue);
		const altonaCityClient = getSanityWriteClient(altonaCityValue);
		expect(williamstownClient.config().projectId).toBe('project-one');
		expect(williamstownClient.config().token).toBe('token-one');
		expect(altonaCityClient.config().token).toBe('token-two');
	});

	it('memoises one write client per tenant', () => {
		process.env.WILLIAMSTOWN_SANITY_WRITE_TOKEN = 'token-one';
		expect(getSanityWriteClient(williamstownValue)).toBe(getSanityWriteClient(williamstownValue));
	});

	it('fails naming the club and key when the write token is missing', () => {
		const unconfiguredValue = makeTenant('demo', 'project-three', 'DEMO_SANITY_WRITE_TOKEN');
		expect(() => getSanityWriteClient(unconfiguredValue)).toThrow(
			/Missing secret "sanityWriteToken" for tenant "demo"[\s\S]*DEMO_SANITY_WRITE_TOKEN/
		);
	});
});
