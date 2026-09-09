# Multi-tenant design

## Goal

Serve many football clubs from one codebase and one Vercel project. The domain in the request
decides which club renders.

```text
www.williamstownsc.com, williamstownsc.com  ->  williamstown
www.altonacity.com,     altonacity.com      ->  altona-city
```

## Decisions

| Decision          | Choice                                               | Why                                                                                              |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Hosting           | One Vercel project, every club domain attached       | One deploy, one build, one set of shared secrets                                                 |
| Content isolation | One Sanity project per club                          | Hard data separation, per-club billing and roles, a club can leave with its own project          |
| Tenant resolution | `proxy.ts` maps `Host` to a tenant slug              | Runs before the cache, so pages stay static per tenant                                           |
| Route shape       | `app/[tenant]` is the root layout                    | The tenant becomes a root parameter, readable anywhere on the server without going dynamic       |
| Tenant registry   | Typed config module in the repo, one folder per club | Simple and type-safe at 2-5 clubs. Move to Edge Config when adding a club must not need a deploy |
| Theme             | One CSS file per club, scoped by `data-tenant`       | Colours sit beside the club's config, not in a shared file every club edits                      |

## How a request flows

```text
GET https://www.altonacity.com/news
  |
  v
proxy.ts
  - drop any x-tenant header the client sent
  - normalise Host: lower-case, strip port, strip leading 'www.'
  - look up the tenant; unknown host -> 404
  - path already starts with a tenant slug -> 404
  - set x-tenant: altona-city
  - rewrite /news -> /altona-city/news
  |
  v
app/[tenant]/(site)/news/page.tsx
  - generateStaticParams() returns every tenant slug
  - await tenant() from next/root-params -> 'altona-city'
  - getSanityClient('altona-city') -> that club's Sanity project
  - cache tag: altona-city:news
```

## Adding a club

Onboarding is manual on purpose. It takes a code change, a review and a deploy. At a handful of
clubs that is the right trade: the registry stays type-checked, the theme stays in version control,
and every club that goes live has been through a PR.

1. Create the Sanity project, deploy the schema, seed `siteSettings`.
2. Add `src/tenants/<slug>/tenant.ts` and `src/tenants/<slug>/theme.css`, and register both.
3. Add the club's secrets in Vercel.
4. Attach the domains to the Vercel project and point DNS at Vercel.
5. Scope any legacy redirects to that club's domains.
6. Deploy.

Improve later, when the club count justifies it:

- Move the domain map to Edge Config, so a new club needs no deploy.
- Move the palette into `siteSettings`, so a club can change its own colours.
- Script steps 1 to 3 as a provisioning command.

## Tenant files

Everything that defines a club at build time lives in one folder.

```text
src/tenants/
  index.ts              registry: imports each tenant.ts, validates with zod
  themes.css            imports every club theme file
  williamstown/
    tenant.ts           slug, domains, Sanity project
    theme.css           [data-tenant='williamstown'] { --color-primary: ... }
  altona-city/
    tenant.ts
    theme.css
```

```ts
type Tenant = {
	slug: string; // 'altona-city', matches /^[a-z0-9]+(?:-[a-z0-9]+)*$/
	domains: string[]; // apex + www + any extra production host
	sanityProjectId: string;
	sanityDataset: string; // 'production'
};
```

The slug is a URL segment, so it is lowercase words joined by hyphens. The JavaScript identifier
rule that `next/root-params` imposes applies to the folder name `[tenant]`, not to the slug value.

Environment variable names derive from the slug: `altona-city` gives `ALTONA_CITY`, so the write
token is `SANITY_WRITE_TOKEN_ALTONA_CITY`.

Everything else about a club lives in its `siteSettings` document: name, logo, contact emails,
socials, SEO defaults, canonical URL, Matchday club id. Do not duplicate any of it here.

## Reading the tenant

Server code gets the tenant three ways, depending on where it runs. They are not interchangeable.

| Where                                                         | How                                       |
| ------------------------------------------------------------- | ----------------------------------------- |
| Server Components, layouts, server utilities                  | `await tenant()` from `next/root-params`  |
| Route Handlers under `[tenant]`: sitemap, robots, manifest    | the `params` prop                         |
| Route Handlers authenticating a webhook: revalidate, Matchday | the validated `Host`, bound to the secret |
| Every other Route Handler, and Server Actions                 | the `x-tenant` request header             |
| Client Components                                             | props, from a Server Component            |

`next/root-params` arrived in Next.js 16.3.0 and this project runs 16.3.4. Because `[tenant]` sits
above the root layout, the getter works in any Server Component without prop drilling and without
`headers()`, so pages stay static. It does not work in Client Components, Server Actions, Route
Handlers or `unstable_cache`.

Content modules call `await tenant()` themselves, so the 18 modules in `lib/content` keep their
current signatures. Code called from a Route Handler or Server Action takes an explicit tenant
argument instead.

## Local and preview hosts

The registry lists production domains only. A separate rule handles everything else, and it is off
in production:

- `<slug>.localhost` and `<slug>.localhost:3003` match the club with that slug. Browsers resolve any
  `.localhost` subdomain with no hosts-file change.
- An unmatched `*.vercel.app` preview host falls back to a default club named by an environment
  variable.

## Sanity access

`getSanityClient(tenant)` replaces the module-level client, memoised in a map keyed by slug. The
same goes for the write client, which takes that club's write token.

`getClientConfig()` stops reading `NEXT_PUBLIC_SANITY_PROJECT_ID`. The project id and dataset come
from the registry.

## Secrets

Shared by every club: AWS SES, reCAPTCHA, Sentry, `SOCIAL_PUBLISH_SECRET`, `MATCHDAY_API_BASE_URL`.

Per club, read through `getTenantSecret(name, tenant)`:

```text
SANITY_WRITE_TOKEN_WILLIAMSTOWN
MATCHDAY_API_TOKEN_WILLIAMSTOWN
MATCHDAY_WEBHOOK_SECRET_WILLIAMSTOWN
REVALIDATE_SECRET_WILLIAMSTOWN
META_PAGE_ACCESS_TOKEN_WILLIAMSTOWN
META_FACEBOOK_PAGE_ID_WILLIAMSTOWN
META_INSTAGRAM_ACCOUNT_ID_WILLIAMSTOWN
```

## Cache tags

Every tag carries a tenant prefix, built by one shared function.

```text
siteSettings  ->  williamstown:siteSettings
news          ->  williamstown:news
```

## Routes and layouts

`src/app/layout.tsx` owns `<html>` and sits above `[tenant]`, so it cannot see the club. It goes
away. Next.js allows multiple root layouts, so the club pages and the Studio each get their own.

```text
src/app/
  [tenant]/
    layout.tsx                      root layout: <html data-tenant>, imports themes.css
    (site)/...                      club pages
    sitemap.ts                      -> /<slug>/sitemap.xml
    robots.txt/route.ts             -> /<slug>/robots.txt
    manifest.webmanifest/route.ts   -> /<slug>/manifest.webmanifest
  studio/
    layout.tsx                      root layout for the Studio
  api/...                           route handlers, no layout
```

The metadata routes sit under `[tenant]` so their paths carry the slug. `sitemap.ts` nests in a
route segment directly. `robots.txt` and `manifest.webmanifest` are app-root-only conventions, so
they become plain Route Handlers that read the slug from `params`.

Public URLs do not change. The slug is only visible after the rewrite.

## Branding

- **Colours**: the root layout sets `<html data-tenant="williamstown">` from the root parameter, so
  it is known at build time. Each `theme.css` scopes its overrides of `--color-primary`,
  `--color-secondary` and `--color-brand` under `[data-tenant='<slug>']`, in both light and dark.
  `themes.css` imports them all, and the root layout imports that. No inline styles.
- **Logo**: already in `siteSettings`.
- **Favicons and PWA icons**: replace the static files in `public/favicon/` with routes under
  `[tenant]`, generated from the club logo in Sanity.
- **Copy**: every hardcoded "Williamstown SC" string moves to `siteSettings`. Known spots are the
  root layout, `not-found.tsx`, the news, sponsors and football sections, the contact email
  template, the calendar feed UID, and the Meta publish hashtags.

## Sanity Studio

`/studio` binds to the Sanity project of the requesting domain, so `williamstownsc.com/studio` edits
Williamstown and `altonacity.com/studio` edits Altona City. The route reads `x-tenant` on the server
and passes `projectId` and `dataset` into `NextStudio`, rather than reading `NEXT_PUBLIC_` variables.

The schema stays one shared set of TypeScript files. Schema deploys and type generation run per
project. The types are identical across projects, so `sanity.types.ts` is generated once from a
reference project.

Open question for MT-14: the root `sanity.config.ts` hardcodes a project id. Either generate one
config per club for standalone deploys, or drop standalone deploys and keep only the app-hosted
Studio.

## Rules that keep clubs apart

These are the constraints the whole design rests on. Break one and a club can read, edit or clear
another club's data.

1. **The proxy owns `x-tenant`.** It deletes any inbound header before setting its own. Otherwise a
   client picks its own club by sending the header.
2. **The proxy rejects paths that already start with a tenant slug.** After the rewrite
   `/altona-city/news` is a real path, so `williamstownsc.com/altona-city/news` must 404. The check
   belongs in the proxy: a layout comparing `[tenant]` against `headers()` would force every route
   dynamic.
3. **`dynamicParams = false` on `[tenant]`.** An unregistered slug cannot render.
4. **No handler falls back to a default club**, and none reads the tenant from a query parameter or
   request body. A handler with a missing or unknown `x-tenant` returns 400.
5. **Webhook handlers bind the tenant to the credential.** `/api/revalidate` and
   `/api/webhooks/league-updates` resolve the club from the validated `Host`, then check the secret
   against that club's secret. A shared secret plus a caller-named club would let anyone holding it
   clear any club's cache. Each club points its webhooks at its own domain.
6. **Every cache is keyed by tenant slug.** The `cachedClientConfig` singleton becomes a map keyed
   by slug. `React.cache` wrappers such as `getMatchdayClubId` take the tenant as their first
   argument, so the slug lands in the cache key.
7. **No module-level Sanity client or config.** A value computed at import time cannot vary by club,
   and will serve one club's data to another.
8. **Readers and invalidators adopt prefixed cache tags in the same change.** Half-migrated, either
   nothing invalidates or one club's revalidation clears every club.
9. **Responses that vary by club vary by path.** `src/app/sitemap.ts` exports `revalidate = 86400`;
   at the app root, resolving the club from `Host` would cache one club's sitemap and serve it to
   every domain. Under `[tenant]` the cache key is per club by construction.
10. **The registry fails the build on collisions.** Two clubs sharing a normalised host or a slug
    would otherwise route at random. Deriving env var names from the slug rules out a third
    collision.
11. **Legacy redirects are scoped by host.** The ten path-only redirects in `vercel.json` would fire
    on every club's domain, so `/shop` would redirect on `altonacity.com`. Add a host condition:

    ```json
    "has": [{ "type": "host", "value": { "inc": ["williamstownsc.com", "www.williamstownsc.com"] } }]
    ```

    Keep them in `vercel.json` while the rules stay simple, since edge redirects run before any
    function. Note that `has` conditions do not work under `vercel dev`.

## What we are not doing

- No per-club Vercel project. One deployment serves every domain.
- No shared Sanity dataset with a club field. Project-per-club already isolates the data.
- No self-serve onboarding. See "Adding a club".

## Sequencing

Work is tracked in the [Multi-tenant platform](https://github.com/dejanvasic85/williamstownsc/milestone/2)
milestone (MT-01 to MT-19), in three phases:

1. **Foundations** - registry, proxy, per-tenant Sanity client and secrets.
2. **Tenant-aware app** - routes, content modules, metadata, theming, API routes, Studio.
3. **Operations** - env conventions, provisioning runbook, test matrix, second club onboarded.
