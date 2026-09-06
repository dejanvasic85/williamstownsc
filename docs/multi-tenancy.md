# Multi-tenant design

## Goal

Serve many football clubs from one codebase and one Vercel project. The domain in the request
decides which club renders.

```
www.williamstownsc.com, williamstownsc.com  ->  williamstown
www.altonacity.com,     altonacity.com      ->  altona-city
```

## Decisions

| Decision          | Choice                                         | Why                                                                                              |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Hosting           | One Vercel project, every club domain attached | One deploy, one build, one set of shared secrets                                                 |
| Content isolation | One Sanity project per club                    | Hard data separation, per-club billing and editor roles, a club can leave with its own project   |
| Tenant resolution | `proxy.ts` maps `Host` to a tenant slug        | Runs before the cache, so pages stay static per tenant                                           |
| Route shape       | Rewrite to `/[tenant]/...`                     | Keeps static generation and ISR; reading `headers()` in pages would force every page dynamic     |
| Tenant registry   | Typed config module in the repo                | Simple and type-safe at 2-5 clubs. Move to Edge Config when adding a club must not need a deploy |

## How a request flows

```
GET https://www.altonacity.com/news
  |
  v
proxy.ts
  - normalise host (strip port, strip www.)
  - look up tenant in the registry
  - unknown host -> 404
  - set request header x-tenant: altona-city
  - rewrite page paths: /news -> /altona-city/news
  |
  v
app/(site)/[tenant]/news/page.tsx
  - generateStaticParams() returns every tenant slug
  - getSanityClient('altona-city') -> that club's Sanity project
  - cache tag: altona-city:news
```

API routes and `/studio` are not rewritten. They read `x-tenant` from the request headers, because
they are dynamic already.

## Tenant registry

`src/lib/tenant/tenants.ts` holds one entry per club, validated with zod at module load.

```ts
type Tenant = {
	slug: string; // 'williamstown'
	domains: string[]; // apex + www + preview hosts
	sanityProjectId: string;
	sanityDataset: string; // 'production'
	secretSuffix: string; // 'WILLIAMSTOWN' -> SANITY_WRITE_TOKEN_WILLIAMSTOWN
	theme: { primary: string; secondary: string; brand: string };
};
```

Everything else about a club (name, logo, contact emails, socials, SEO defaults, canonical URL,
Matchday club id) already lives in that club's `siteSettings` document. Do not duplicate it here.

Local development and preview deployments use subdomain hosts, which browsers resolve without any
hosts-file change:

```
williamstown.localhost:3003
altona-city.localhost:3003
```

## Secrets

Shared across all tenants: AWS SES credentials, reCAPTCHA, Sentry, `REVALIDATE_SECRET`,
`SOCIAL_PUBLISH_SECRET`.

Per tenant, resolved by suffix through a `getTenantSecret(name, tenant)` function in `lib/config`:

```
SANITY_WRITE_TOKEN_WILLIAMSTOWN
MATCHDAY_API_TOKEN_WILLIAMSTOWN
MATCHDAY_WEBHOOK_SECRET_WILLIAMSTOWN
META_PAGE_ACCESS_TOKEN_WILLIAMSTOWN
META_FACEBOOK_PAGE_ID_WILLIAMSTOWN
META_INSTAGRAM_ACCOUNT_ID_WILLIAMSTOWN
```

`getClientConfig()` stops reading `NEXT_PUBLIC_SANITY_PROJECT_ID`. The project id and dataset come
from the tenant registry instead.

## Cache tags

Every tag gets a tenant prefix. Without this, revalidating one club clears another club's pages.

```
siteSettings  ->  williamstown:siteSettings
news          ->  williamstown:news
```

`/api/revalidate` and `/api/webhooks/league-updates` take the tenant from the request (query
parameter or signed payload) and prefix tags before calling `revalidateTag`.

## Branding

- **Colours**: a `data-tenant` attribute on `<html>`, with one CSS block per tenant in
  `globals.css` overriding `--color-primary`, `--color-secondary` and `--color-brand`. No inline
  styles. If the club count grows past roughly ten, move the palette into `siteSettings` and emit a
  single `<style>` element instead.
- **Logo**: already in `siteSettings`.
- **Favicons and PWA icons**: replace the static files in `public/favicon/` with `app/manifest.ts`
  and `app/icon.tsx`, both resolving the tenant from the host.
- **Copy**: every hardcoded "Williamstown SC" string moves to `siteSettings`. Known sites are the
  root layout, `not-found.tsx`, the news, sponsors and football sections, the contact email
  template, the calendar feed UID, and the Meta publish hashtags.

## Sanity Studio

`/studio` binds to the Sanity project of the requesting domain, so
`williamstownsc.com/studio` edits Williamstown and `altonacity.com/studio` edits Altona City. The
Studio page reads the tenant server-side and passes `projectId` and `dataset` into `NextStudio`
instead of reading `NEXT_PUBLIC_` variables.

The schema stays one shared set of TypeScript files. Deploying the schema and generating types run
per project. Types are identical across projects, so `sanity.types.ts` is still generated once from
a reference project.

## What we are not doing

- No per-club Vercel project. One deployment serves every domain.
- No shared Sanity dataset with a club field. Project-per-club already isolates the data.
- No tenant-aware `vercel.json` redirects. The current redirects are legacy Williamstown URLs and
  stay global until a second club needs its own. Per-club redirects then move into `proxy.ts`.

## Adding a club

1. Create the Sanity project, deploy the schema, seed `siteSettings`.
2. Add the tenant entry to `tenants.ts`.
3. Add the per-tenant secrets in Vercel.
4. Add the domains to the Vercel project and point DNS at Vercel.
5. Deploy.

## Sequencing

Work is tracked in the [Multi-tenant platform](https://github.com/dejanvasic85/williamstownsc/milestone/2)
milestone (issues MT-01 to MT-18), in three phases:

1. **Foundations** - registry, proxy, per-tenant Sanity client and secrets.
2. **Tenant-aware app** - route restructure, content modules, metadata, theming, API routes, Studio.
3. **Operations** - env conventions, provisioning runbook, test matrix, second club onboarded.
