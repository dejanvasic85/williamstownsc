import { describe, expect, it } from 'vitest';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { buildTenantCacheTag } from './cacheTagService';

function makeTenant(slug: string): Tenant {
	return {
		slug,
		domains: [`${slug}.example.com`],
		sanity: { projectId: `${slug}-project`, dataset: 'production' },
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

describe('buildTenantCacheTag', () => {
	it('prefixes a tag with the club slug', () => {
		expect(buildTenantCacheTag(makeTenant('williamstown'), 'newsArticle')).toBe(
			'williamstown:newsArticle'
		);
	});

	it('gives two clubs the same tag a different key', () => {
		const williamstownTag = buildTenantCacheTag(makeTenant('williamstown'), 'newsArticle');
		const altonaCityTag = buildTenantCacheTag(makeTenant('altona-city'), 'newsArticle');

		expect(williamstownTag).not.toBe(altonaCityTag);
	});
});
