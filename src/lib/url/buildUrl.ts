/**
 * Safely builds a URL by combining a base URL with path segments using the native URL class
 * @param baseUrl - The base URL (with or without trailing slash)
 * @param paths - Path segments to append (with or without leading/trailing slashes)
 * @returns The complete URL with properly normalized slashes
 *
 * @example
 * buildUrl('https://example.com/', 'news', 'article-slug')
 * // => 'https://example.com/news/article-slug'
 *
 * @example
 * buildUrl('https://example.com', '/news/', '/article-slug/')
 * // => 'https://example.com/news/article-slug'
 */
export function buildUrl(baseUrl: string, ...paths: string[]): string {
	if (!baseUrl) {
		throw new Error('baseUrl is required');
	}

	const url = new URL(baseUrl);

	const normalizedPaths = paths
		.filter((path) => path.length > 0)
		.map((path) => path.replace(/^\/+|\/+$/g, ''));

	if (normalizedPaths.length > 0) {
		url.pathname = `/${normalizedPaths.join('/')}`;
	}

	return url.toString();
}
