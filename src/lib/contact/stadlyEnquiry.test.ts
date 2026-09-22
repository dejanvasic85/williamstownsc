import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Tenant } from '@/tenants/schema/tenantSchema';
import type { PlayerFormData } from './contactFormSchema';
import { sendEnquiryToStadly } from './stadlyEnquiry';

const envKey = 'WILLIAMSTOWN_STADLY_ENQUIRY_URL';
const endpointValue = 'https://www.stadly.com.au/api/public/enquiries/wf_test';

const tenantValue: Tenant = {
	slug: 'williamstown',
	domains: ['williamstownsc.com'],
	sanity: { projectId: '1ougwkz1', dataset: 'production' },
	secrets: {
		sanityWriteToken: { from: 'env', key: 'WILLIAMSTOWN_SANITY_WRITE_TOKEN' },
		revalidateSecret: { from: 'env', key: 'WILLIAMSTOWN_REVALIDATE_SECRET' },
		enquiryIntakeUrl: { from: 'env', key: envKey }
	},
	theme: {
		light: { primary: '#1a4ba6', secondary: '#c9a900', brand: '#1a4ba6' },
		dark: { primary: 'oklch(72% 0.18 260)', secondary: '#c9a900', brand: '#1a4ba6' }
	}
};

const playerValue: PlayerFormData = {
	contactType: 'player',
	name: 'Sam Okafor',
	email: 'sam@example.com',
	phone: '0400 000 000',
	message: 'Keen to join the Under 13s.',
	ageGroup: 'Under 13',
	position: 'midfield'
};

const fetchMock = vi.fn();

beforeEach(() => {
	vi.stubGlobal('fetch', fetchMock);
	fetchMock.mockReset();
	fetchMock.mockResolvedValue({ ok: true, status: 202 });
	process.env[envKey] = endpointValue;
});

afterEach(() => {
	vi.unstubAllGlobals();
	delete process.env[envKey];
});

describe('sendEnquiryToStadly', () => {
	it('posts the enquiry with its kind, contact details and extra fields', async () => {
		await sendEnquiryToStadly(playerValue, tenantValue);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe(endpointValue);
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body)).toEqual({
			kind: 'player',
			contactName: 'Sam Okafor',
			contactEmail: 'sam@example.com',
			contactPhone: '0400 000 000',
			message: 'Keen to join the Under 13s.',
			source: 'website',
			details: { ageGroup: 'Under 13', position: 'midfield' }
		});
	});

	it('sends nothing when the club has no intake endpoint', async () => {
		delete process.env[envKey];

		await sendEnquiryToStadly(playerValue, tenantValue);

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('swallows a network failure', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(sendEnquiryToStadly(playerValue, tenantValue)).resolves.toBeUndefined();
	});

	it('swallows a rejected response', async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 422 });

		await expect(sendEnquiryToStadly(playerValue, tenantValue)).resolves.toBeUndefined();
	});
});
