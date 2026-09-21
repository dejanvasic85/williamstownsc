import { describe, expect, it } from 'vitest';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { buildRewritePath, isTenantPrefixedPath, withRewritePath } from './proxy';

const williamstownValue: Tenant = {
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

describe('buildRewritePath', () => {
	it('rewrites the root to the club home page', () => {
		expect(buildRewritePath(williamstownValue, '/')).toBe('/williamstown');
	});

	it('rewrites page paths under the club slug', () => {
		expect(buildRewritePath(williamstownValue, '/news')).toBe('/williamstown/news');
	});

	it('rewrites metadata files under the club slug', () => {
		expect(buildRewritePath(williamstownValue, '/sitemap.xml')).toBe('/williamstown/sitemap.xml');
		expect(buildRewritePath(williamstownValue, '/robots.txt')).toBe('/williamstown/robots.txt');
		expect(buildRewritePath(williamstownValue, '/manifest.webmanifest')).toBe(
			'/williamstown/manifest.webmanifest'
		);
	});

	it('rewrites icon requests to the club static files', () => {
		expect(buildRewritePath(williamstownValue, '/favicon.ico')).toBe(
			'/tenants/williamstown/favicon.ico'
		);
		expect(buildRewritePath(williamstownValue, '/icon.svg')).toBe('/tenants/williamstown/icon.svg');
		expect(buildRewritePath(williamstownValue, '/icon-512.png')).toBe(
			'/tenants/williamstown/icon-512.png'
		);
	});

	it('leaves api, studio and Next internals unrewritten', () => {
		expect(buildRewritePath(williamstownValue, '/api/health')).toBeNull();
		expect(buildRewritePath(williamstownValue, '/api/webhooks/league-updates')).toBeNull();
		expect(buildRewritePath(williamstownValue, '/studio')).toBeNull();
		expect(buildRewritePath(williamstownValue, '/_next/static/x.js')).toBeNull();
	});

	it('leaves club-prefixed paths unrewritten so previews can reach them', () => {
		expect(buildRewritePath(williamstownValue, '/williamstown/news')).toBeNull();
		expect(buildRewritePath(williamstownValue, '/williamstown')).toBeNull();
	});
});

describe('withRewritePath', () => {
	it('keeps the query string when changing the path', () => {
		const rewritten = withRewritePath(
			new URL('https://williamstownsc.com/news?page=2'),
			'/williamstown/news'
		);

		expect(rewritten.pathname).toBe('/williamstown/news');
		expect(rewritten.search).toBe('?page=2');
	});

	it('does not mutate the original URL', () => {
		const original = new URL('https://williamstownsc.com/news');

		withRewritePath(original, '/williamstown/news');

		expect(original.pathname).toBe('/news');
	});
});

describe('isTenantPrefixedPath', () => {
	const slugs = ['williamstown', 'altona-city'];

	it('matches an exact slug path', () => {
		expect(isTenantPrefixedPath('/williamstown', slugs)).toBe(true);
	});

	it('matches a slug-prefixed path', () => {
		expect(isTenantPrefixedPath('/williamstown/news', slugs)).toBe(true);
	});

	it('does not match a slug embedded in a longer segment', () => {
		expect(isTenantPrefixedPath('/williamstownsc/news', slugs)).toBe(false);
		expect(isTenantPrefixedPath('/news', slugs)).toBe(false);
	});
});
