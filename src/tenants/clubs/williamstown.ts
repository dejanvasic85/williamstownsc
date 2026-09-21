import 'server-only';
import { defineTenant } from '../schema/tenantSchema';

export const williamstown = defineTenant({
	slug: 'williamstown',
	// williamstownsc.vercel.app is the project's stable production alias. Listing it here
	// resolves the club by host, so CI e2e runs against production reach the real routes
	// instead of the club-neutral 404 the non-production host rules would otherwise give.
	domains: ['williamstownsc.com', 'www.williamstownsc.com', 'williamstownsc.vercel.app'],
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
});
