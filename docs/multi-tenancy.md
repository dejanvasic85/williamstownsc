# Multi-tenant design

## Goal

Serve many football clubs from one codebase and one Vercel project. The domain in the request
decides which club renders.

```text
www.williamstownsc.com, williamstownsc.com  ->  williamstown
www.altonacity.com,     altonacity.com      ->  altona-city
```

Each club keeps its own domain in production. Previews and the demo club sit on `stadly.com.au`,
since these sites are an addon to Stadly rather than a Williamstown product.

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
4. Store the club's secrets wherever its manifest says they live.
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

## The demo club

A white-label club, `demo`, is the second tenant and lands early rather than last. It is not a
customer. It exists to make the rest of the work testable, and it does three jobs:

- **Proof.** Multi-tenancy cannot be tested with one club. Every change after the routes move is
  verified against two clubs rather than reasoned about.
- **The preview default.** A bare preview URL renders the demo club, so a PR never shows a real
  club's content by accident.
- **A stable content fixture.** End-to-end content assertions run against it, so tests do not break
  when someone edits a Williamstown news article.

It needs its own Sanity project, seeded with enough content to render every page. It has no Facebook
page, so it omits the `socialPublishing` group, which is the case that forced optional secrets.

It lives at `demo.stadly.com.au`, so it doubles as the place to point a club asking what a Stadly
site looks like.

## Tenant files

One file per club, named after the club, holding everything that defines it.

```text
src/tenants/
  index.ts           registry: imports each club file, validates with zod
  williamstown.ts
  demo.ts
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
		revalidateSecret: { from: 'env', key: 'WILLIAMSTOWN_REVALIDATE_SECRET' }
	},
	// optional: a club without a Facebook page omits this block entirely
	socialPublishing: {
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

Check while building the registry that `server-only` resolves in `proxy.ts`, which imports it. It
should, because the proxy runs on the server, but this project is on Next.js 16 and worth
confirming rather than assuming.

The manifest declares **where a secret comes from**, never the value. That buys three things:

- **Per-club, per-secret sources.** `from: 'env'` today, `from: 'ssm'` for one club tomorrow. No
  global migration and no flag day. `getTenantSecret` dispatches on `from`.
- **A preflight check.** Because every secret is declared, a script can walk the registry and assert
  each one resolves. CI catches a missing value before deploy, instead of a code path hitting it in
  production.
- **No naming convention to remember.** The key is written down.

Not every club uses every integration. `sanityWriteToken` and `revalidateSecret` are required, and
`socialPublishing` is an optional group. A club without a Facebook page omits the whole block, and
social publishing is then off for that club. Grouping the three rather than making each optional on
its own stops a club being half-configured, with a page id but no token.

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

## Environments

The registry lists production domains only. Everything else resolves through rules that are off in
production.

| Environment    | Host                         | Club comes from     | Real host resolution |
| -------------- | ---------------------------- | ------------------- | -------------------- |
| Local          | `<slug>.localhost:3003`      | the subdomain       | yes                  |
| Per-PR preview | the generated deployment URL | the path, else demo | no                   |
| Production     | the club's own domains       | the `Host` header   | yes                  |

There is no staging environment. Production already has real per-club hosts, so it is where
host-dependent checks belong.

Gate the non-production rules on `VERCEL_ENV !== 'production'`, not `NODE_ENV`. Next.js sets
`NODE_ENV=production` for preview builds too, so `NODE_ENV` cannot tell a preview from production
and the fallbacks would stay live in production.

### Local

`<slug>.localhost` and `<slug>.localhost:3003` match the club with that slug. Browsers resolve any
`.localhost` subdomain with no hosts-file change.

### Per-PR previews

Each deployment gets one generated URL, so there is no per-club host to use. Two rules make it
workable:

- A bare preview URL falls back to the demo club. Resolve that slug through the registry like any
  other, so an unknown default fails loudly rather than routing.
- A path that starts with a slug resolves to that club rather than returning 404, so
  `<preview-url>/altona-city/news` works. Those routes already exist, because `generateStaticParams`
  generates them. Rule 2 is the only thing blocking them, and it exists to stop one club's
  **production domain** reaching another club. A preview host is nobody's domain, so there is
  nothing to protect.

On Pro, a preview deployment suffix rebrands the generated URL from `*.vercel.app` to
`*.preview.stadly.com.au`. Cosmetic, plus it scopes cookies to our own domain, and it means a link
sent to a club is not a Williamstown URL. It does not change the shape above: still one host per
deployment, not one per club.

### What a preview cannot prove

The path prefix reaches a club without touching `Host` resolution, so a preview never exercises the
registry lookup, normalisation, the `www.` strip, or rule 2.

That does not need a staging environment. It splits two ways:

- **The logic is pure, so it belongs in vitest.** Host normalisation, registry lookup, collision
  detection, rule 2's path check and secret resolution are all functions with no environment. Unit
  tests are faster and cover more cases than any deployed environment could.
- **The rest needs distinct real hosts, and production has them.** Once Williamstown and the demo
  club are both live, a post-deploy check runs against the real domains. Those checks are read-only
  apart from revalidation, which only busts a cache.

That trades a small window, where a host-level integration bug is caught just after deploy rather
than just before, against not running a whole extra environment. For a handful of club sites that is
the right side of the trade.

## Sanity access

`getSanityClient(tenant)` replaces the module-level client, memoised in a map keyed by slug. The
same goes for the write client, which takes that club's write token.

`getClientConfig()` stops reading `NEXT_PUBLIC_SANITY_PROJECT_ID`. The project id and dataset come
from the registry.

## Secrets

Five secrets are per club, read through `getTenantSecret(name, tenant)`, which resolves them from
that club's manifest:

| Per club                 | Used by                    | Required             |
| ------------------------ | -------------------------- | -------------------- |
| `sanityWriteToken`       | form submissions           | yes                  |
| `revalidateSecret`       | that club's Sanity webhook | yes                  |
| `metaPageAccessToken`    | social publishing          | only with that group |
| `metaFacebookPageId`     | social publishing          | only with that group |
| `metaInstagramAccountId` | social publishing          | only with that group |

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

The schema stays one shared set of TypeScript files, bundled into this Studio, so deploying the app
updates every club at once. See "Schema and data across projects" for what that does and does not
cover.

## Rules that keep clubs apart

These are the constraints the whole design rests on. Break one and a club can read, edit or clear
another club's data.

1. **The proxy owns `x-tenant`.** It deletes any inbound header before setting its own. Otherwise a
   client picks its own club by sending the header.
2. **The proxy rejects paths that already start with a tenant slug.** After the rewrite
   `/altona-city/news` is a real path, so `williamstownsc.com/altona-city/news` must 404. The check
   belongs in the proxy: a layout comparing `[tenant]` against `headers()` would force every route
   dynamic. This rule protects production club domains, so it is off when
   `VERCEL_ENV !== 'production'`, which is what makes preview URLs usable.
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

## Schema and data across projects

One Sanity project per club raises an obvious worry: does every schema change now need deploying N
times? Mostly no, but there are two different things here and only one is hard.

### Schema is code, so it deploys once

The schema lives in `src/sanity/schema/*.ts` and is bundled into the Studio at `/studio`. Since that
Studio binds to the requesting domain's project, deploying the app updates the schema for every club
in one go. There is no per-project schema step.

The exception is the standalone Studio at `williamstownsc.sanity.studio`, deployed by
`.github/workflows/deploy-sanity.yml`. That one is tied to a single project and `studioHost`, so
keeping it means one config, one host and one deploy per club, every schema change. Dropping it
costs editors a bookmark and gains a club-branded URL they already have. That is the open question
in the Sanity Studio section, and dropping it is the recommendation.

`pnpm run type:gen` still runs against one reference project, which is correct because the schema is
identical everywhere. `sanity.cli.ts` points at that reference project directly, since
`getClientConfig()` no longer carries the project id.

### Data does not migrate itself

This is the real gap. Renaming a field, adding a required one or changing a type leaves existing
documents untouched, and each club has its own documents. Sanity migrations run per project, so one
change means N runs that must all succeed or the clubs drift apart.

Sanity does not track which migrations have run. Rather than keeping our own ledger, write
migrations to be idempotent, so re-running one is harmless and the recovery for a partial failure is
simply to run it again.

## Shipping this to a live site

Williamstown is in production the whole time, so the order matters more than the dependency graph
alone shows. Three groups:

**Additive, safe on their own.** The registry, the per-club Sanity client factory and the secret
resolver can all ship with nothing using them yet. Add `getSanityClient` alongside the existing
singleton rather than replacing it, so nothing breaks while callers still import the old one.

**The cutover, which ships as one deploy.** The proxy and the route move go together. The proxy
rewrites every page path to `/<slug>/...`, and those routes do not exist until the move happens, so
shipping the proxy first takes the site down. Still one club at this point, so the singleton client
is still correct and the site should look identical.

**Everything after, incremental.** Content modules, cache tags, metadata, theming and the rest each
ship on their own.

One ordering trap: the demo club cannot arrive until the content modules take a tenant **and** cache
tags carry a prefix. Land it earlier and the second club renders Williamstown's content from a
shared cache, because the singleton client and the unprefixed tags are both still club-blind.

Rollback is a Vercel redeploy of the previous build. Nothing here migrates data, and no public URL
changes, so there is nothing to undo beyond the deployment itself.

## Testing

Confidence comes from three layers, each running where it is cheapest.

| Layer          | Tool       | Runs                 | Covers                                                          |
| -------------- | ---------- | -------------------- | --------------------------------------------------------------- |
| **Unit**       | vitest     | every PR             | host resolution, registry, rule 2, secrets, cache tag building  |
| **Structural** | Playwright | every PR, per club   | pages load, nav renders, robots, sitemap, manifest, theme, 404s |
| **Content**    | Playwright | every PR, on `demo`  | editorial assertions against content we control                 |
| **Isolation**  | Playwright | after deploy to prod | the rules, against real club domains                            |

Vitest is configured but unused so far, so this work writes the first tests against it.

### Unit

Most of the isolation rules are pure functions, so they need no environment at all:

- Host normalisation: lower-case, strip port, strip leading `www.`.
- Registry lookup, including an unknown host and the non-production rules.
- Collision detection, so two clubs cannot share a host, slug or secret key.
- Rule 2's check that a path does not already start with a slug.
- Secret resolution, including an omitted optional group.

These are faster and cover more cases than any deployed environment could, so put the work here
first.

### Structural and content

The Playwright project matrix is generated from `getAllTenants()`, so adding a club adds coverage
automatically and the matrix cannot drift from the registry. Structural tests assert shape, not
copy. Content assertions run against `demo` rather than Williamstown, so they do not break when
someone edits a live article.

### Isolation

These need distinct real hosts, so they run against production after a deploy, where Williamstown
and `demo` are real domains. They are read-only apart from revalidation, which only busts a cache.

- A spoofed `x-tenant` header on one club's domain does not change which club renders.
- `williamstownsc.com/demo/news` returns 404.
- An unknown host returns 404 with no club branding.
- Revalidating one club leaves another club's cached pages alone.
- Each domain serves its own robots, sitemap, manifest and icons, with no cross-club URL.
- A contact form on one domain does not reach another club's inbox.

A failure here means rolling back, not blocking a merge. The unit layer is what stops most of these
reaching production in the first place.

## What we are not doing

- No per-club Vercel project. One deployment serves every domain.
- No shared Sanity dataset with a club field. Project-per-club already isolates the data.
- No self-serve onboarding. See "Adding a club".

## Sequencing

Work is tracked in the [Multi-tenant platform](https://github.com/dejanvasic85/williamstownsc/milestone/2)
milestone, in three phases. Each issue names what blocks it, so the order lives there rather than
being repeated here.

1. **Foundations** - registry, proxy, per-tenant Sanity client and secrets.
2. **Tenant-aware app** - routes, content modules, metadata, theming, API routes, Studio.
3. **Operations** - env conventions, provisioning runbook, test matrix, second club onboarded.
