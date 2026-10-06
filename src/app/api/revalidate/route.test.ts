import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import { POST } from './route';

const revalidateTagMock = vi.hoisted(() => vi.fn());
const getTenantFromHeadersMock = vi.hoisted(() => vi.fn());
const getTenantSecretMock = vi.hoisted(() => vi.fn());

vi.mock('next/cache', () => ({ revalidateTag: revalidateTagMock }));
vi.mock('@/tenants/request', () => ({ getTenantFromHeaders: getTenantFromHeadersMock }));
vi.mock('@/tenants/secrets/tenantSecrets', () => ({ getTenantSecret: getTenantSecretMock }));
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

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

const validSecret = 'correct-secret';

function makeRequest(secret: string | null, body: unknown): NextRequest {
	const headers = new Headers({ 'content-type': 'application/json' });
	if (secret !== null) {
		headers.set('x-revalidate-secret', secret);
	}

	return new NextRequest('http://localhost/api/revalidate', {
		method: 'POST',
		headers,
		body: JSON.stringify(body)
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	getTenantFromHeadersMock.mockResolvedValue(tenantValue);
	getTenantSecretMock.mockReturnValue(validSecret);
});

describe('POST /api/revalidate', () => {
	it('revalidates the club-prefixed tag for the resolved tenant', async () => {
		const response = await POST(makeRequest(validSecret, { _type: 'newsArticle' }));

		expect(response.status).toBe(200);
		expect(revalidateTagMock).toHaveBeenCalledWith('williamstown:newsArticle', 'max');
		expect(revalidateTagMock).not.toHaveBeenCalledWith('newsArticle', 'max');
	});

	it('returns 400 and revalidates nothing when no tenant resolves', async () => {
		getTenantFromHeadersMock.mockResolvedValue(null);

		const response = await POST(makeRequest(validSecret, { _type: 'newsArticle' }));

		expect(response.status).toBe(400);
		expect(revalidateTagMock).not.toHaveBeenCalled();
	});

	it('returns 401 and revalidates nothing when the secret is wrong', async () => {
		const response = await POST(makeRequest('wrong-secret', { _type: 'newsArticle' }));

		expect(response.status).toBe(401);
		expect(revalidateTagMock).not.toHaveBeenCalled();
	});
});
