# Multi-tenant design

## Goal

Serve many football clubs from one codebase and one Vercel project. The domain in the request
decides which club renders.

```text
www.williamstownsc.com, williamstownsc.com  ->  williamstown
www.altonacity.com,     altonacity.com      ->  altona-city
```

## Decisions

| Decision          | Choice                                                | Why                                                                                              |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Hosting           | One Vercel project, every club domain attached        | One deploy, one build, one set of shared secrets                                                 |
| Content isolation | One Sanity project per club                           | Hard data separation, per-club billing and roles, a club can leave with its own project          |
| Tenant resolution | `proxy.ts` maps `Host` to a tenant slug               | Runs before the cache, so pages stay static per tenant                                           |
| Route shape       | `app/[tenant]` is the root layout                     | The tenant becomes a root parameter, readable anywhere on the server without going dynamic       |
| Tenant registry   | Typed config module in the repo, one file per club    | Simple and type-safe at 2-5 clubs. Adding a club is a code change, on purpose                    |
| Theme             | Server-only tokens per club, emitted as one `<style>` | Colours sit beside the club's config, never reach a JS bundle, and stay readable from the server |
| Secrets           | Per-club manifest declaring where each value lives    | Reviewable, verifiable in CI, and the store can change per club without touching call sites      |

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
      rewritten:     page paths, /sitemap.xml, /robots.txt, /manifest.webmanifest
                     icons -> /tenants/<slug>/... (static files)
      not rewritten: /api/..., /studio, /_next, other static files
      those still get x-tenant, they just keep their path
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
2. Add `src/tenants/<slug>.ts` and register it.
3. Add the club's icons to `public/tenants/<slug>/`.
4. Store the club's five secrets wherever its manifest says they live.
5. Attach the domains to the Vercel project and point DNS at Vercel.
6. Scope any legacy redirects to that club's domains.
7. Run the preflight check, then deploy.

Improve later, when the club count justifies it:

- Script steps 1 to 4 as a provisioning command.
- Move the palette into `siteSettings`, so a club can change its own colours.
- Move the domain map to Edge Config, so **changing a club's domains** needs no deploy.

That last one does not make **adding** a club deploy-free, and it is worth being clear about why.
Three things still come from the build:

- `generateStaticParams()` returns the slugs known at build time.
- `dynamicParams = false` rejects any slug it did not generate.
- The club's config file is code: secrets, theme and Sanity project.

Adding a club without a deploy would mean moving all of that to runtime, turning `dynamicParams`
back on and giving up per-club prerendering. That is a different architecture, not an increment.
Deploy-free onboarding is not on this roadmap.

## Tenant files

One file per club, named after the club, holding everything that defines it.

```text
src/tenants/
  index.ts           registry: imports each club file, validates with zod
  williamstown.ts
  altona-city.ts
```

```ts
// williamstown.ts
import 'server-only';

export const williamstown = defineTenant({
	slug: 'williamstown', // matches /^[a-z0-9]+(?:-[a-z0-9]+)*$/
	domains: ['williamstownsc.com', 'www.williamstownsc.com'],
	sanity: { projectId: '1ougwkz1', dataset: 'production' },
	secrets: {
		sanityWriteToken: { from: 'env', key: 'WILLIAMSTOWN_SANITY_WRITE_TOKEN' },
		revalidateSecret: { from: 'env', key: 'WILLIAMSTOWN_REVALIDATE_SECRET' },
		metaPageAccessToken: { from: 'env', key: 'WILLIAMSTOWN_META_PAGE_ACCESS_TOKEN' },
		metaFacebookPageId: { from: 'env', key: 'WILLIAMSTOWN_META_FACEBOOK_PAGE_ID' },
		metaInstagramAccountId: { from: 'env', key: 'WILLIAMSTOWN_META_INSTAGRAM_ACCOUNT_ID' }
	},
	theme: {
		light: { primary: '#1a4ba6', secondary: '#c9a900', brand: '#1a4ba6' },
		dark: { primary: 'oklch(72% 0.18 260)', secondary: '#c9a900', brand: '#1a4ba6' }
	}
});
```

The whole file is server-only, including the public parts. Nothing on the client needs it:

- `sanityImageLoader` only rewrites query parameters on a URL it is already given, so it never needs
  the project id.
- Client Components that show the club name, such as `MobileHeader` and `DesktopNavbar`, take it as
  a prop from a Server Component.
- Theme tokens reach the browser as CSS, emitted by the root layout, never as JavaScript.
- `ConfigProvider` does hand `ClientConfig` to the browser, but the only field any Client Component
  reads is `recaptchaSiteKey`, through `useConfig` in `ReCaptcha` and `ContactForm`. That is
  system-wide, not per club. `ClientConfig` can drop its Sanity fields entirely.

Check during MT-01 that `server-only` resolves in `proxy.ts`, which imports the registry. It should,
because the proxy runs on the server, but this project is on Next.js 16 and worth confirming rather
than assuming.

The manifest declares **where a secret comes from**, never the value. That buys three things:

- **Per-club, per-secret sources.** `from: 'env'` today, `from: 'ssm'` for one club tomorrow. No
  global migration and no flag day. `getTenantSecret` dispatches on `from`.
- **A preflight check.** Because every secret is declared, a script can walk the registry and assert
  each one resolves. CI catches a missing value before deploy, instead of a code path hitting it in
  production.
- **No naming convention to remember.** The key is written down.

Every per-club secret is read at request time, so a runtime store works for all of them. Nothing
club-specific is needed during `next build`.

The slug is a URL segment, so it is lowercase words joined by hyphens. The JavaScript identifier
rule that `next/root-params` imposes applies to the folder name `[tenant]`, not to the slug value.

Everything else about a club lives in its `siteSettings` document: name, logo, contact emails,
socials, SEO defaults, canonical URL, Matchday club id. Do not duplicate any of it here.

## Reading the tenant

Server code gets the tenant five ways, depending on where it runs. They are not interchangeable.

| Where                                                      | How                                       |
| ---------------------------------------------------------- | ----------------------------------------- |
| Server Components, layouts, server utilities               | `await tenant()` from `next/root-params`  |
| Route Handlers under `[tenant]`: sitemap, robots, manifest | the `params` prop                         |
| `global-not-found.tsx`                                     | nothing, it is club-neutral               |
| `/api/revalidate`                                          | the validated `Host`, bound to the secret |
| `/api/webhooks/league-updates`                             | the payload, after the signature verifies |
| Every other Route Handler, and Server Actions              | the `x-tenant` request header             |
| Client Components                                          | props, from a Server Component            |

`next/root-params` arrived in Next.js 16.3.0 and this project runs 16.3.4. Because `[tenant]` sits
above the root layout, the getter works in any Server Component without prop drilling and without
`headers()`, so pages stay static. It does not work in Client Components, Server Actions, Route
Handlers or `unstable_cache`.

Content modules call `await tenant()` themselves, so the 18 modules in `lib/content` keep their
current signatures. Code called from a Route Handler or Server Action takes an explicit tenant
argument instead.

## Local and preview hosts

The registry lists production domains only. A separate rule handles everything else:

- `<slug>.localhost` and `<slug>.localhost:3003` match the club with that slug. Browsers resolve any
  `.localhost` subdomain with no hosts-file change.
- An unmatched `*.vercel.app` preview host falls back to a default club named by an environment
  variable. Resolve that slug through the registry like any other, so an unknown default fails
  loudly rather than routing.

Gate the rule on `VERCEL_ENV !== 'production'`, not `NODE_ENV`. Next.js sets `NODE_ENV=production`
for preview builds too, so `NODE_ENV` cannot tell a preview from production and the fallback would
stay live in production.

## Sanity access

`getSanityClient(tenant)` replaces the module-level client, memoised in a map keyed by slug. The
same goes for the write client, which takes that club's write token.

`getClientConfig()` stops reading `NEXT_PUBLIC_SANITY_PROJECT_ID`. The project id and dataset come
from the registry.

## Secrets

Five secrets are per club, read through `getTenantSecret(name, tenant)`, which resolves them from
that club's manifest:

| Per club                 | Used by                    |
| ------------------------ | -------------------------- |
| `sanityWriteToken`       | form submissions           |
| `revalidateSecret`       | that club's Sanity webhook |
| `metaPageAccessToken`    | social publishing          |
| `metaFacebookPageId`     | social publishing          |
| `metaInstagramAccountId` | social publishing          |

Everything else is system-wide and stays a plain environment variable:

| System-wide                                         | Note                                       |
| --------------------------------------------------- | ------------------------------------------ |
| `MATCHDAY_API_TOKEN`, `MATCHDAY_API_BASE_URL`       | one API for every club                     |
| `MATCHDAY_WEBHOOK_SECRET`                           | one webhook for every club                 |
| `MATCHDAY_GITHUB_TOKEN`                             | `pnpm install` only, never read by the app |
| AWS SES, reCAPTCHA, Sentry, `SOCIAL_PUBLISH_SECRET` | unchanged                                  |

Matchday is one service with one token. The club is identified by `siteSettings.matchday.clubId`,
not by a per-club credential.

## Cache tags

Content pulled from a club's own Sanity project carries a tenant prefix, built by one shared
function.

```text
siteSettings  ->  williamstown:siteSettings
news          ->  williamstown:news
```

**Matchday league tags are the exception and stay unprefixed.**

```text
matchday:league:<leagueId>    shared by every club in that league
```

League ladders and fixtures come from one Matchday API with one system token, and the response is
the same whoever asks. A league also spans clubs, so two clubs in the same division legitimately
read the same data. Prefixing it per club would store the same payload once per club and multiply
Matchday API calls by the number of clubs, for no isolation gain.

The test for any tag: **does the response depend on which club is asking?** Sanity content does, so
it gets a prefix. Matchday league data does not, so it does not. Club-specific rendering on top of
league data, such as picking out that club's fixtures, happens at render time and is covered by the
page's own prefixed tags.

## Routes and layouts

`src/app/layout.tsx` owns `<html>` and sits above `[tenant]`, so it cannot see the club. It goes
away. Next.js allows multiple root layouts, so the club pages and the Studio each get their own.

```text
src/app/
  [tenant]/
    layout.tsx                      root layout: <html data-tenant>, emits theme tokens
    (site)/...                      club pages
    sitemap.xml/route.ts            -> /<slug>/sitemap.xml
    robots.txt/route.ts             -> /<slug>/robots.txt
    manifest.webmanifest/route.ts   -> /<slug>/manifest.webmanifest
  studio/
    layout.tsx                      root layout for the Studio
  api/...                           route handlers, no layout
  global-not-found.tsx              club-neutral 404, owns its own <html>
  global-error.tsx                  unchanged, already owns its own <html>
```

All four metadata routes are **plain Route Handlers**, not metadata file conventions. Next.js
documents `robots.txt` and `manifest.webmanifest` only at the app root, and it documents a nested
`sitemap.ts` receiving `id` from `generateSitemaps` but not `params` from a dynamic segment. Route
Handlers definitely receive `params`, so all four use the same mechanism and none of it rests on
undocumented behaviour.

Public URLs do not change. The slug is only visible after the rewrite.

### The 404 page

Next.js names two cases that need `app/global-not-found.tsx` instead of `app/not-found.tsx`, and
this design hits both: multiple root layouts, and a root layout under a top-level dynamic segment.
With no layout at the app root, there is nothing for a root `not-found.tsx` to render inside.

`global-not-found.tsx` returns a full HTML document, including `<html>` and `<body>`.

It must be **club-neutral**. It renders for requests where no club could be resolved: an unknown
host (rule 1), a path already carrying a slug (rule 2), and an unregistered slug (rule 3). There is
no `siteSettings` to read and no theme to apply, so it carries no club name, logo or colours. The
existing `src/app/not-found.tsx` hardcodes "Williamstown SC" and goes away.

A 404 _inside_ a club, such as a missing news article, still renders that club's own
`not-found.tsx` under `[tenant]`, with its branding intact.

`global-error.tsx` already defines its own `<html>` and `<body>` and replaces the root layout when
active, so removing the root layout does not affect it.

## Branding

- **Colours**: each club's tokens live in the `theme` block of `src/tenants/<slug>.ts`, which is
  server-only. The root layout is a Server Component, so it reads the active club's tokens and emits
  one `<style>` element overriding `--color-primary`, `--color-secondary` and `--color-brand` on
  `:root`, for light and dark.

  Only the active club's colours reach the HTML, and no club's tokens reach a JavaScript bundle.
  The `server-only` import turns a mistake into a build error rather than a review comment. This is
  a `<style>` element, not a style attribute, so it stays inside the no-inline-styles rule, and the
  values are known at build time so the layout stays static.

  Keeping the tokens in TypeScript rather than CSS also means the PWA manifest can read
  `theme_color` directly. CSS is not readable from a Route Handler.

  `<html data-tenant="williamstown">` stays, for debugging and any club-specific rule beyond the
  tokens.

- **Logo**: already in `siteSettings`. That is the in-page header logo, a different job from the
  icons below.
- **Copy**: every hardcoded "Williamstown SC" string moves to `siteSettings`. Known spots are the
  root layout, the 404 pages, the news, sponsors and football sections, the contact email
  template, the calendar feed UID, and the Meta publish hashtags.

## Icons and the PWA manifest

Icons are static files per club. The manifest is a Route Handler. They are solved differently
because one is a design asset and the other reads content.

### Icons: static files, not generated

```text
public/tenants/williamstown/
  favicon.ico
  icon.svg
  apple-icon.png     180x180
  icon-192.png       maskable
  icon-512.png       maskable
```

Not generated from the Sanity logo, for three reasons:

- Maskable icons need a padded safe zone at exact square sizes. Cropping an arbitrary logo upload
  to that automatically gives poor results.
- Static files are served by the CDN with no function call and no image transformation charge,
  which `AGENTS.md` already tells us to avoid.
- A club's crest changes about never. Treating it as a committed asset matches the rest of
  onboarding, which is a code change on purpose.

Delete `src/app/favicon.ico`, `src/app/icon.svg` and `src/app/apple-icon.png`. Those are Next.js
metadata file conventions, so leaving them in place makes Next emit root-level icon links that
compete with the per-club ones. Delete `public/favicon/` too. While replacing them, note that the
current `icon.svg` is 257KB and worth shrinking.

### Manifest: a Route Handler

`src/app/[tenant]/manifest.webmanifest/route.ts` reads the slug from `params`, takes `name` and
`short_name` from that club's `siteSettings.clubName`, `theme_color` and `background_color` from its
`theme` block, and points `icons` at the static paths above. Keeping it a handler means the club
name is not written down a second time.

### Two traps

**Emitted links stay unprefixed.** The layout points at `/icon.svg` and `/manifest.webmanifest`,
never `/williamstown/icon.svg`, and the proxy rewrites them. A slug-prefixed link would be a request
whose path starts with a known slug, which rule 2 rejects with a 404.

**Do not use the boilerplate proxy matcher.** The common Next.js matcher excludes `favicon.ico` by
name. Copy it and a bare `/favicon.ico` never reaches the proxy, so every club falls back to
whatever sits at the root. Browsers request that path on their own whatever the page links to, so it
has to be matched and rewritten.

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
5. **Webhook handlers never let an unauthenticated caller name the club.** The two handlers do this
   differently, because their senders differ:
   - `/api/revalidate` takes the club from the validated `Host` and checks the request secret
     against **that club's** `revalidateSecret`. Each club has its own Sanity project, so each has
     its own secret and points its webhook at its own domain. A shared secret plus a caller-named
     club would let anyone holding it clear any club's cache.
   - `/api/webhooks/league-updates` verifies `X-Matchday-Signature` against the system-wide
     `MATCHDAY_WEBHOOK_SECRET`, then revalidates `matchday:league:<leagueId>`. It needs no club
     binding, because the payload names a **league**, not a club, and a league spans clubs. The tag
     it clears is exactly the data that webhook owns, so its blast radius is already correct.
6. **Every cache is keyed by tenant slug.** The `cachedClientConfig` singleton becomes a map keyed
   by slug. `React.cache` wrappers such as `getMatchdayClubId` take the tenant as their first
   argument, so the slug lands in the cache key.
7. **No module-level Sanity client or config.** A value computed at import time cannot vary by club,
   and will serve one club's data to another.
8. **Readers and invalidators adopt prefixed cache tags in the same change.** Half-migrated, either
   nothing invalidates or one club's revalidation clears every club. The one exception is data that
   does not depend on the club, currently `matchday:league:*`, which stays unprefixed on purpose.
9. **Responses that vary by club vary by path.** `src/app/sitemap.ts` exports `revalidate = 86400`
   today;
   at the app root, resolving the club from `Host` would cache one club's sitemap and serve it to
   every domain. Under `[tenant]` the cache key is per club by construction.
10. **The registry fails the build on collisions.** Check three things: two clubs must not share a
    normalised host, a slug, or a secret key. The first two would route at random. The third would
    quietly point two clubs at one credential, and since the manifest writes keys out by hand rather
    than deriving them from the slug, nothing else prevents it.
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
milestone (MT-01 to MT-20), in three phases:

1. **Foundations** - registry, proxy, per-tenant Sanity client and secrets.
2. **Tenant-aware app** - routes, content modules, metadata, theming, API routes, Studio.
3. **Operations** - env conventions, provisioning runbook, test matrix, second club onboarded.
