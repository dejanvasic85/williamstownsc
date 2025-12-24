import { headers } from 'next/headers';

/**
 * Gets the base URL (protocol + host) from the current request
 * Useful for building URLs that reflect the actual environment (production/preview/localhost)
 *
 * @returns The base URL (e.g., 'https://example.com', 'http://localhost:3000')
 *
 * @example
 * // On production
 * await getRequestBaseUrl()
 * // => 'https://williamstownsc.com'
 *
 * @example
 * // On Vercel preview
 * await getRequestBaseUrl()
 * // => 'https://preview-abc123.vercel.app'
 *
 * @example
 * // On localhost
 * await getRequestBaseUrl()
 * // => 'http://localhost:3000'
 */
export async function getRequestBaseUrl(): Promise<string> {
	const headersList = await headers();
	const host = headersList.get('host');

	if (!host) {
		throw new Error('Unable to determine host from request headers');
	}

	const protocol = host.includes('localhost') ? 'http' : 'https';

	return `${protocol}://${host}`;
}
