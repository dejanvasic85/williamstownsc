'use client';

import { useConfig } from '@/lib/hooks/useConfig';
import Script from 'next/script';

declare global {
	interface Window {
		grecaptcha: {
			enterprise: {
				ready: (callback: () => void) => void;
				execute: (siteKey: string, options: { action: string }) => Promise<string>;
			};
		};
	}
}

let recaptchaReady = false;
let readyPromise: Promise<void> | null = null;

function waitForRecaptcha(): Promise<void> {
	if (recaptchaReady) {
		return Promise.resolve();
	}

	if (readyPromise) {
		return readyPromise;
	}

	readyPromise = new Promise((resolve) => {
		const checkReady = () => {
			if (window.grecaptcha?.enterprise) {
				window.grecaptcha.enterprise.ready(() => {
					recaptchaReady = true;
					resolve();
				});
			} else {
				setTimeout(checkReady, 100);
			}
		};
		checkReady();
	});

	return readyPromise;
}

/**
 * Executes the Google reCAPTCHA Enterprise for the given action and site key.
 *
 * @param {string} action - The action name to be used for reCAPTCHA verification.
 * @param {string} siteKey - The site key for reCAPTCHA Enterprise.
 * @returns {Promise<string | null>} A promise that resolves to the reCAPTCHA token string if successful,
 * or null if the site key is not configured or if execution fails.
 *
 * Returns null if:
 * - The site key is not provided.
 * - An error occurs during reCAPTCHA execution.
 */
export async function executeReCaptcha(action: string, siteKey: string): Promise<string | null> {
	if (!siteKey) {
		console.warn('reCAPTCHA site key not configured - bot protection disabled');
		return null;
	}

	try {
		await waitForRecaptcha();
		const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
		return token;
	} catch (error) {
		console.error('reCAPTCHA execution failed:', error);
		return null;
	}
}

export function ReCaptcha() {
	const { recaptchaSiteKey } = useConfig();

	if (!recaptchaSiteKey) {
		return null;
	}

	return (
		<Script
			src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`}
			strategy="lazyOnload"
		/>
	);
}
