import { afterEach, describe, expect, it } from 'vitest';
import { getClientConfig, getSanityReadConfig } from './config';

const sanityEnvKeys = [
	'NEXT_PUBLIC_SANITY_PROJECT_ID',
	'NEXT_PUBLIC_SANITY_DATASET',
	'NEXT_PUBLIC_SANITY_API_VERSION'
] as const;

afterEach(() => {
	for (const key of sanityEnvKeys) {
		delete process.env[key];
	}
	delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
});

describe('getClientConfig', () => {
	it('carries only the reCAPTCHA site key, never Sanity project details', () => {
		process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'should-not-leak';
		process.env.NEXT_PUBLIC_SANITY_DATASET = 'should-not-leak';
		process.env.NEXT_PUBLIC_SANITY_API_VERSION = 'should-not-leak';
		process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'site-key';

		const config = getClientConfig();

		expect(config).toEqual({ recaptchaSiteKey: 'site-key' });
		expect(Object.keys(config)).toEqual(['recaptchaSiteKey']);
	});

	it('allows an unset reCAPTCHA site key', () => {
		expect(getClientConfig()).toEqual({ recaptchaSiteKey: undefined });
	});
});

describe('getSanityReadConfig', () => {
	it('reads the Sanity project from the server-only env vars', () => {
		process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = '1ougwkz1';
		process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
		process.env.NEXT_PUBLIC_SANITY_API_VERSION = '2024-06-01';

		expect(getSanityReadConfig()).toEqual({
			projectId: '1ougwkz1',
			dataset: 'production',
			apiVersion: '2024-06-01'
		});
	});
});
