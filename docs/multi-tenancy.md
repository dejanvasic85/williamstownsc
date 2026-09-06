# Multi-tenant design

## Goal

Serve many football clubs from one codebase and one Vercel project. The domain in the request
decides which club renders.

```text
www.williamstownsc.com, williamstownsc.com  ->  williamstown
www.altonacity.com,     altonacity.com      ->  altona-city
```

## Decisions

| Decision          | Choice                                               | Why                                                                                               |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Hosting           | One Vercel project, every club domain attached       | One deploy, one build, one set of shared secrets                                                  |
| Content isolation | One Sanity project per club                          | Hard data separation, per-club billing and editor roles, a club can leave with its own project    |
| Tenant resolution | `proxy.ts` maps `Host` to a tenant slug              | Runs before the cache, so pages stay static per tenant                                            |
| Route shape       | `app/[tenant]` is the root layout                    | The tenant is a root parameter, readable anywhere on the server without forcing dynamic rendering |
| Tenant registry   | Typed config module in the repo, one folder per club | Simple and type-safe at 2-5 clubs. Move to Edge Config when adding a club must not need a deploy  |
| Theme             | One CSS file per club, scoped by `data-tenant`       | Colours live beside the club's config, not in a shared file that every club edits                 |

## Tenant files

Everything that defines a club at build time lives in one folder, so onboarding touches one place.

```text
src/tenants/
  index.ts              registry: imports each tenant.ts, validates with zod
  themes.css            imports every club theme file
  williamstown/
    tenant.ts           slug, domains, Sanity project, secret suffix
    theme.css           [data-tenant='williamstown'] { --color-primary: ... }
  altona-city/
    tenant.ts
    theme.css
```

```ts
type Tenant = {
	slug: string; // 'williamstown', a valid JS identifier segment
	domains: string[]; // apex + www + any extra production host
	sanityProjectId: string;
	sanityDataset: string; // 'production'
	secretSuffix: string; // 'WILLIAMSTOWN' -> SANITY_WRITE_TOKEN_WILLIAMSTOWN
};
```

Everything else about a club (name, logo, contact emails, socials, SEO defaults, canonical URL,
Matchday club id) already lives in that club's `siteSettings` document. Do not duplicate it here.

## How a request flows

```text
GET https://www.altonacity.com/news
  |
  v
proxy.ts
  - strip any inbound x-tenant header from the client
  - normalise Host: lower-case, strip port, strip leading 'www.'
  - look up the tenant in the registry; unknown host -> 404
  - set x-tenant: altona-city on the request
  - rewrite page paths: /news -> /altona-city/news
  |
  v
app/[tenant]/(site)/news/page.tsx
  - generateStaticParams() returns every tenant slug
  - await tenant() from next/root-params -> 'altona-city'
  - getSanityClient('altona-city') -> that club's Sanity project
  - cache tag: altona-city:news
```

## Reading the tenant

Two mechanisms, because Next.js supports root parameters in Server Components but not yet in Route
Handlers.

| Where                                        | How                                        |
| -------------------------------------------- | ------------------------------------------ |
| Server Components, layouts, server utilities | `await tenant()` from `next/root-params`   |
| Route Handlers and Server Actions            | the `x-tenant` request header              |
| Client Components                            | props, passed down from a Server Component |

`next/root-params` arrived in Next.js 16.3.0 and this project is on 16.3.4. Because `[tenant]` sits
above the root layout, the getter works in any Server Component without prop drilling and without
`headers()`, so pages stay statically generated. It does not work in Client Components, Server
Actions, Route Handlers or `unstable_cache`.

### x-tenant is proxy-issued, never client-supplied

`x-tenant` is a trusted value only because the proxy controls it. The proxy deletes any inbound
`x-tenant` header before setting its own, so a client cannot pick a club by sending the header
itself. Any Route Handler that receives a missing or unknown `x-tenant` returns 400 and does no
work. No handler falls back to a default club.

## Local and preview hosts

Registry entries list production domains only. Non-production hosts are resolved by a rule that is
disabled in production:

- `<slug>.localhost` and `<slug>.localhost:3003` match the tenant with that slug. Browsers resolve
  any `.localhost` subdomain without a hosts-file change.
- A Vercel preview host (`*.vercel.app`) with no registry match falls back to a default tenant named
  by an environment variable, so preview deployments still render.

In production the rule is off, so an unmapped host is a 404 and never resolves to a club.

## Sanity access and caching

`getSanityClient(tenant)` replaces the module-level client. Two rules follow from it:

- **Every cache is keyed by tenant slug.** The current `cachedClientConfig` singleton in
  `lib/config.ts` becomes a map keyed by slug. Any `React.cache` wrapper, such as
  `getMatchdayClubId`, takes the tenant as its first argument so the slug is part of the cache key.
- **No module-level client or config.** A module-scope value computed at import time cannot vary by
  club and will silently serve one club's data to another.

Content modules read the tenant themselves with `await tenant()` rather than taking it as an
argument, so the 18 modules in `lib/content` keep their current signatures. The exception is code
called from a Route Handler or Server Action, which must accept an explicit tenant argument.

## Secrets

Shared across all tenants: AWS SES credentials, reCAPTCHA, Sentry, `SOCIAL_PUBLISH_SECRET`.

Per tenant, resolved by suffix through `getTenantSecret(name, tenant)` in `lib/config`:

```text
SANITY_WRITE_TOKEN_WILLIAMSTOWN
MATCHDAY_API_TOKEN_WILLIAMSTOWN
MATCHDAY_WEBHOOK_SECRET_WILLIAMSTOWN
REVALIDATE_SECRET_WILLIAMSTOWN
META_PAGE_ACCESS_TOKEN_WILLIAMSTOWN
META_FACEBOOK_PAGE_ID_WILLIAMSTOWN
META_INSTAGRAM_ACCOUNT_ID_WILLIAMSTOWN
```

`getClientConfig()` stops reading `NEXT_PUBLIC_SANITY_PROJECT_ID`. The project id and dataset come
from the tenant registry instead.

## Cache tags

Every tag gets a tenant prefix. Without it, revalidating one club clears another club's pages.

```text
siteSettings  ->  williamstown:siteSettings
news          ->  williamstown:news
```

One function builds every tag, and readers and invalidators must move together in a single change.
If readers adopt `tenant:contentType` while `/api/revalidate` still calls `revalidateTag('news')`,
nothing invalidates. If unprefixed tags survive anywhere, one club's revalidation clears every club.

## Revalidation and webhooks

`/api/revalidate` today authenticates one shared `REVALIDATE_SECRET` and revalidates an unprefixed
tag. A shared credential plus a caller-supplied tenant would let anyone holding the secret clear any
club's cache. So the tenant is bound to the credential, not chosen by the caller:

- `REVALIDATE_SECRET` becomes per tenant. The handler resolves the tenant from the validated `Host`,
  then checks the request secret against that tenant's secret. A secret that does not match the
  tenant fails, so one club's Sanity project cannot revalidate another club.
- `/api/webhooks/league-updates` does the same, verifying `X-Matchday-Signature` with that club's
  `MATCHDAY_WEBHOOK_SECRET` and revalidating only that club's tags.
- Each club's Sanity project and Matchday club point their webhooks at that club's own domain.

## Layout structure

`src/app/layout.tsx` currently owns `<html>` and sits above `[tenant]`, so it cannot see the club.
Reading `headers()` there would make every route dynamic and undo the static generation the design
depends on.

The fix is to remove the top-level layout and use multiple root layouts, which Next.js supports
through route groups:

```text
src/app/
  [tenant]/
    layout.tsx          root layout: <html data-tenant>, imports tenants/themes.css
    (site)/...          club pages
  studio/
    layout.tsx          root layout for the Studio
  api/...               route handlers, no layout
  robots.ts             resolves the tenant from Host
  sitemap.ts            resolves the tenant from Host
  manifest.ts           resolves the tenant from Host
```

`robots.ts`, `sitemap.ts` and `manifest.ts` are route handlers, so they cannot use root parameters
and resolve the tenant from the host instead. They are dynamic as a result, which is fine for three
small responses. The proxy does not rewrite their paths.

## Branding

- **Colours**: `<html data-tenant="williamstown">` in the root layout, set from the root parameter,
  so it is known at build time. Each club's `theme.css` scopes its overrides of `--color-primary`,
  `--color-secondary` and `--color-brand` under `[data-tenant='<slug>']`, for both light and dark.
  `themes.css` imports them all and the root layout imports that. No inline styles.
- **Logo**: already in `siteSettings`.
- **Favicons and PWA icons**: replace the static files in `public/favicon/` with generated routes
  built from the club logo in Sanity.
- **Copy**: every hardcoded "Williamstown SC" string moves to `siteSettings`. Known sites are the
  root layout, `not-found.tsx`, the news, sponsors and football sections, the contact email
  template, the calendar feed UID, and the Meta publish hashtags.

## Sanity Studio

`/studio` binds to the Sanity project of the requesting domain, so `williamstownsc.com/studio` edits
Williamstown and `altonacity.com/studio` edits Altona City. The Studio route resolves the tenant
from `x-tenant` server-side and passes `projectId` and `dataset` into `NextStudio` instead of
reading `NEXT_PUBLIC_` variables. A missing or unknown tenant renders an error, not a default club.

The schema stays one shared set of TypeScript files. Deploying the schema and generating types run
per project. Types are identical across projects, so `sanity.types.ts` is still generated once from
a reference project.

## What we are not doing

- No per-club Vercel project. One deployment serves every domain.
- No shared Sanity dataset with a club field. Project-per-club already isolates the data.
- No self-serve club onboarding. See below.
- No tenant-aware `vercel.json` redirects. The current redirects are legacy Williamstown URLs and
  stay global until a second club needs its own. Per-club redirects then move into `proxy.ts`.

## Adding a club

Onboarding is a manual process, on purpose. It needs a code change, a review and a deploy. At a
handful of clubs that is the right trade: the registry stays type-checked, the theme stays in
version control, and every club that goes live has been through a PR.

1. Create the Sanity project, deploy the schema, seed `siteSettings`.
2. Add `src/tenants/<slug>/tenant.ts` and `src/tenants/<slug>/theme.css`, and register both.
3. Add the per-tenant secrets in Vercel.
4. Add the domains to the Vercel project and point DNS at Vercel.
5. Deploy.

Improve later, when the club count justifies it:

- Move the domain map to Edge Config so a new club needs no deploy.
- Move the palette into `siteSettings` so a club can change its own colours.
- Script steps 1 to 3 as a provisioning command.

## Sequencing

Work is tracked in the [Multi-tenant platform](https://github.com/dejanvasic85/williamstownsc/milestone/2)
milestone (issues MT-01 to MT-18), in three phases:

1. **Foundations** - registry, proxy, per-tenant Sanity client and secrets.
2. **Tenant-aware app** - route restructure, content modules, metadata, theming, API routes, Studio.
3. **Operations** - env conventions, provisioning runbook, test matrix, second club onboarded.
