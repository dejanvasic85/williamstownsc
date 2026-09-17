import { describe, expect, it } from 'vitest';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { getSanityClient } from './client';

function makeTenant(slug: string, projectId: string): Tenant {
	return {
		slug,
		domains: [`${slug}.example.com`],
		sanity: { projectId, dataset: 'production' },
		secrets: {
			sanityWriteToken: { from: 'env', key: `${slug.toUpperCase()}_SANITY_WRITE_TOKEN` },
			revalidateSecret: { from: 'env', key: `${slug.toUpperCase()}_REVALIDATE_SECRET` }
		},
		theme: {
			light: { primary: '#1a4ba6', secondary: '#c9a900', brand: '#1a4ba6' },
			dark: { primary: 'oklch(72% 0.18 260)', secondary: '#c9a900', brand: '#1a4ba6' }
		}
	};
}

const williamstownValue = makeTenant('williamstown', 'project-one');
const altonaCityValue = makeTenant('altona-city', 'project-two');

describe('getSanityClient', () => {
	it('points each club at its own Sanity project', () => {
		const williamstownClient = getSanityClient(williamstownValue);
		const altonaCityClient = getSanityClient(altonaCityValue);
		expect(williamstownClient.config().projectId).toBe('project-one');
		expect(altonaCityClient.config().projectId).toBe('project-two');
		expect(williamstownClient.config().dataset).toBe('production');
	});

	it('memoises one client per tenant', () => {
		expect(getSanityClient(williamstownValue)).toBe(getSanityClient(williamstownValue));
	});

	it('keeps the read client on the CDN and published perspective', () => {
		expect(getSanityClient(williamstownValue).config().useCdn).toBe(true);
		expect(getSanityClient(williamstownValue).config().perspective).toBe('published');
	});
});
