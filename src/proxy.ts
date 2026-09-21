import { type NextRequest, NextResponse } from 'next/server';
import { getAllTenants, getTenantByHost, normaliseHost } from '@/tenants';
import type { Tenant } from '@/tenants/schema/tenantSchema';

const tenantHeader = 'x-tenant';

// Metadata and icon requests keep their public path but must resolve per club.
// The sitemap route lives at /[tenant]/sitemap (not sitemap.xml) because Next treats a
// folder ending in sitemap.xml as a static metadata file and drops the tenant param.
const metadataFileRewritesValue: Record<string, string> = {
	'/sitemap.xml': '/sitemap',
	'/robots.txt': '/robots.txt',
	'/manifest.webmanifest': '/manifest.webmanifest'
};

const iconFileRewritesValue: Record<string, string> = {
	'/favicon.ico': '/favicon.ico',
	'/icon.svg': '/icon.svg',
	'/apple-icon.png': '/apple-icon.png',
	'/icon-192.png': '/icon-192.png',
	'/icon-512.png': '/icon-512.png'
};

// Paths that are never rewritten to /<slug>/..., but still carry x-tenant. Public files
// under /img and /tenants keep their own path; the icon rewrite points at /tenants.
const unrewrittenPathPrefixesValue = ['/api', '/studio', '/_next', '/img', '/tenants'];

// Rewriting to a path no route matches renders global-not-found.tsx with a 404 status.
const unmatchedRoutePath = '/__unmatched_route__';

// The health endpoint is system-wide, so any host may probe it without a club.
const healthPath = '/api/health';

// The registry is module data, so the slug list is known at load time.
const tenantSlugsValue = getAllTenants().map((tenant) => tenant.slug);

function isHealthPath(pathname: string): boolean {
	return pathname === healthPath || pathname.startsWith(`${healthPath}/`);
}

export function isTenantPrefixedPath(pathname: string, slugs: readonly string[]): boolean {
	return slugs.some((slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`));
}

function isUnrewrittenPath(pathname: string): boolean {
	return unrewrittenPathPrefixesValue.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

export function withRewritePath(url: URL, pathname: string): URL {
	const rewritten = new URL(url);
	rewritten.pathname = pathname;
	return rewritten;
}

export function buildRewritePath(tenant: Tenant, pathname: string): string | null {
	const iconFile = iconFileRewritesValue[pathname];
	if (iconFile) {
		return `/tenants/${tenant.slug}${iconFile}`;
	}

	const metadataFile = metadataFileRewritesValue[pathname];
	if (metadataFile) {
		return `/${tenant.slug}${metadataFile}`;
	}

	if (isUnrewrittenPath(pathname)) {
		return null;
	}

	// A preview URL can reach a club by path prefix, so those paths are already real routes.
	if (isTenantPrefixedPath(pathname, tenantSlugsValue)) {
		return null;
	}

	return `/${tenant.slug}${pathname === '/' ? '' : pathname}`;
}

export function proxy(request: NextRequest) {
	const host = normaliseHost(request.headers.get('host') ?? '');
	const tenant = getTenantByHost(host);

	// Rule 1: the proxy owns x-tenant, so drop anything a client sent.
	const requestHeaders = new Headers(request.headers);
	requestHeaders.delete(tenantHeader);

	function renderNotFound(): NextResponse {
		return NextResponse.rewrite(withRewritePath(request.nextUrl, unmatchedRoutePath), {
			request: { headers: requestHeaders }
		});
	}

	if (isHealthPath(request.nextUrl.pathname)) {
		return NextResponse.next({ request: { headers: requestHeaders } });
	}

	// Requests with no club render the club-neutral 404. Rewriting to a path no route
	// matches triggers global-not-found.tsx; a bare 404 response would be an empty page.
	if (!tenant) {
		return renderNotFound();
	}

	// Rule 2: reject paths that already carry a tenant slug on a production club domain.
	// Off outside production, which is what makes preview URLs reachable by path.
	if (isTenantPrefixedPath(request.nextUrl.pathname, tenantSlugsValue)) {
		if (process.env.VERCEL_ENV === 'production') {
			return renderNotFound();
		}
	}

	requestHeaders.set(tenantHeader, tenant.slug);

	const rewritePath = buildRewritePath(tenant, request.nextUrl.pathname);
	if (rewritePath) {
		const response = NextResponse.rewrite(withRewritePath(request.nextUrl, rewritePath), {
			request: { headers: requestHeaders }
		});
		response.headers.set(tenantHeader, tenant.slug);
		return response;
	}

	const response = NextResponse.next({ request: { headers: requestHeaders } });
	response.headers.set(tenantHeader, tenant.slug);
	return response;
}

export const config = {
	// Match everything except Next.js internals. /api, /studio and public files stay
	// matched so they carry x-tenant; the proxy simply leaves their path alone.
	// The common boilerplate matcher excludes favicon.ico by name, which must not be
	// copied: browsers request /favicon.ico on their own, so it has to be rewritten.
	matcher: ['/((?!_next/static|_next/image|_next/data).*)']
};
