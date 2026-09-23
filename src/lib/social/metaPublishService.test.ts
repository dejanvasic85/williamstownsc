import { beforeEach, describe, expect, it } from 'vitest';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { type SocialPublishArticle, publishArticleToSocials } from './metaPublishService';

const articleValue: SocialPublishArticle = {
	title: 'Match report',
	excerpt: 'A short excerpt',
	imageUrl: 'https://example.com/image.jpg',
	articleUrl: 'https://example.com/news/match-report',
	// Both platforms off, so a configured club stops before any network call.
	publishToFacebook: false,
	publishToInstagram: false
};

const baseTenantValue: Tenant = {
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

const socialTenantValue: Tenant = {
	...baseTenantValue,
	socialPublishing: {
		metaPageAccessToken: { from: 'env', key: 'WILLIAMSTOWN_META_PAGE_ACCESS_TOKEN' },
		metaFacebookPageId: { from: 'env', key: 'WILLIAMSTOWN_META_FACEBOOK_PAGE_ID' },
		metaInstagramAccountId: { from: 'env', key: 'WILLIAMSTOWN_META_INSTAGRAM_ACCOUNT_ID' }
	}
};

beforeEach(() => {
	delete process.env.NEXT_PUBLIC_ENV;
	delete process.env.WILLIAMSTOWN_META_PAGE_ACCESS_TOKEN;
	delete process.env.WILLIAMSTOWN_META_FACEBOOK_PAGE_ID;
	delete process.env.WILLIAMSTOWN_META_INSTAGRAM_ACCOUNT_ID;
});

describe('publishArticleToSocials', () => {
	it('publishes nothing when the club omits the socialPublishing group', async () => {
		await expect(publishArticleToSocials(articleValue, baseTenantValue)).resolves.toEqual([]);
	});

	it('fails naming the club, secret and key when the group is declared but a value is missing', async () => {
		await expect(publishArticleToSocials(articleValue, socialTenantValue)).rejects.toThrow(
			/Missing secret "metaPageAccessToken" for tenant "williamstown"[\s\S]*WILLIAMSTOWN_META_PAGE_ACCESS_TOKEN/
		);
	});

	it('reads the group when it is declared and every value is set', async () => {
		process.env.WILLIAMSTOWN_META_PAGE_ACCESS_TOKEN = 'page-token';
		process.env.WILLIAMSTOWN_META_FACEBOOK_PAGE_ID = 'page-id';
		process.env.WILLIAMSTOWN_META_INSTAGRAM_ACCOUNT_ID = 'instagram-id';

		await expect(publishArticleToSocials(articleValue, socialTenantValue)).resolves.toEqual([]);
	});
});
