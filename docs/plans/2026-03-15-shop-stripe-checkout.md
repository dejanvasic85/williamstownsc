# Shop Feature — Custom Cart + Stripe Checkout

**Created:** 2026-03-15
**Status:** ⏳ Pending

## Purpose

Add an online shop to sell club merchandise (jerseys, shorts, socks, etc). Products managed in Sanity CMS, cart built with DaisyUI, payment via Stripe Checkout hosted page. Replaces the current static `/football/merchandise` page with a browsable product catalogue + checkout flow.

## Requirements

- Products managed in Sanity (name, description, price, images, sizes, stock, category)
- Product catalogue page with filtering by category
- Individual product detail page with size selection and add-to-cart
- Cart drawer/modal with quantity controls, persisted in localStorage
- Stripe Checkout (hosted mode) — redirect to Stripe for payment
- Webhook endpoint for order fulfilment (email confirmation, stock updates)
- Currency: AUD, amounts in cents
- Mobile-first, light/dark theme support, a11y AA
- SEO: product pages with structured data (JSON-LD Product schema)
- No user accounts needed — guest checkout only
- Out of scope: shipping calculator, inventory sync, order management dashboard (phase 2)

## Architecture

```text
Sanity CMS (products)  →  /football/merchandise (catalogue)
                          /football/merchandise/[slug] (product detail)
                              ↓
                        Cart (React context + localStorage)
                              ↓
                        Server action: createCheckoutSession
                              ↓
                        Stripe Checkout (hosted page)
                              ↓
                        Webhook: checkout.session.completed
                              ↓
                        Send confirmation email (AWS SES)
```

## Todo

### Phase 1: Sanity Schema + Content Module

- [ ] Create `productCategory` document schema — name, slug, order (used as reference in products)
- [ ] Create `product` schema — name, slug, description (portable text), price (number, cents), images (array), category (reference to productCategory), sizes (array of strings), inStock (boolean), order (number)
- [ ] Register schemas in `src/sanity/schema/index.ts`
- [ ] Run `npm run type:gen` to generate types
- [ ] Create `src/lib/content/products.ts` — queries: `getProducts`, `getProductBySlug`, `getProductCategories`

### Phase 2: Cart State

- [ ] Create `src/lib/cart/cartContext.tsx` — React context with useReducer (add, remove, update qty, clear)
- [ ] Persist cart to localStorage, hydrate on mount
- [ ] Create `src/lib/cart/cartTypes.ts` — CartItem, CartState types
- [ ] Add CartProvider to site layout (hydrate localStorage reads in useEffect to avoid SSR hydration mismatch)

### Phase 3: Product Catalogue UI

- [ ] Update `/football/merchandise/page.tsx` — fetch products from Sanity, render product grid with category filter
- [ ] Create `src/components/shop/ProductCard.tsx` — image, name, price, "View" link
- [ ] Create `src/components/shop/CategoryFilter.tsx` — horizontal filter chips
- [ ] Create `src/components/shop/PriceDisplay.tsx` — format cents to AUD string

### Phase 4: Product Detail Page

- [ ] Create `/football/merchandise/[slug]/page.tsx` — product detail with image gallery, size picker, add-to-cart button
- [ ] Create `src/components/shop/ImageGallery.tsx` — main image + thumbnails
- [ ] Create `src/components/shop/SizePicker.tsx` — size selection buttons
- [ ] Create `src/components/shop/AddToCartButton.tsx` — adds item to cart context
- [ ] Add JSON-LD Product structured data

### Phase 5: Cart UI

- [ ] Create `src/components/shop/CartDrawer.tsx` — slide-out drawer with cart items, qty controls, total, checkout button
- [ ] Create `src/components/shop/CartIcon.tsx` — navbar cart icon with item count badge
- [ ] Add CartIcon to `DesktopNavbar` and `MobileNavbar` client components (not server Navbar.tsx)
- [ ] Create `src/components/shop/CartItemRow.tsx` — line item display with remove/qty controls

### Phase 6: Stripe Integration

- [ ] Install `stripe` (server) and `@stripe/stripe-js` (client)
- [ ] Add Stripe config to `src/lib/config.ts` — stripeSecretKey, stripePublishableKey, stripeWebhookSecret
- [ ] Add env vars to `.env.example`: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Create `src/lib/stripe/stripeClient.ts` — server-side Stripe instance
- [ ] Create server action `src/app/(site)/football/merchandise/actions.ts` — `createCheckoutSession`: verify stock availability, validate cart items against Sanity prices, create Stripe session, redirect. Handle out-of-stock with user-facing error. Handle price changes between cart and checkout (show warning)
- [ ] Create `src/app/api/webhooks/stripe/route.ts` — verify signature, handle `checkout.session.completed`, ensure idempotency (deduplicate by session ID), log errors with session IDs for debugging
- [ ] Create success page `/football/merchandise/checkout/success/page.tsx` — clear cart client-side on mount (webhooks cannot access localStorage)
- [ ] Create cancel page `/football/merchandise/checkout/cancel/page.tsx`

### Phase 7: Order Confirmation

- [ ] Send order confirmation email via AWS SES on webhook receipt. Log failure with session ID; add retry with exponential backoff
- [ ] Create email template in `src/lib/contact/` (reuse existing SES setup)

### Phase 8: Testing

- [ ] E2E tests: product catalogue page loads, filtering works, product detail renders
- [ ] E2E tests: add to cart, update qty, remove item, cart persists on reload
- [ ] E2E tests: checkout flow redirects to Stripe (mock or test mode)
- [ ] E2E tests: success page clears cart

### Verification

- [ ] Run `npm run type:gen`
- [ ] Run `npm run type:check`
- [ ] Run `npm run lint`
- [ ] Run `npm run format`
- [ ] Run `npm run build`

## Files

### New Files

- `src/sanity/schema/product.ts` — product document schema
- `src/sanity/schema/productCategory.ts` — category document
- `src/lib/content/products.ts` — Sanity queries for products
- `src/lib/cart/cartContext.tsx` — cart React context + provider
- `src/lib/cart/cartTypes.ts` — cart type definitions
- `src/lib/stripe/stripeClient.ts` — server Stripe instance
- `src/components/shop/ProductCard.tsx`
- `src/components/shop/CategoryFilter.tsx`
- `src/components/shop/PriceDisplay.tsx`
- `src/components/shop/ImageGallery.tsx`
- `src/components/shop/SizePicker.tsx`
- `src/components/shop/AddToCartButton.tsx`
- `src/components/shop/CartDrawer.tsx`
- `src/components/shop/CartIcon.tsx`
- `src/components/shop/CartItemRow.tsx`
- `src/app/(site)/football/merchandise/[slug]/page.tsx`
- `src/app/(site)/football/merchandise/actions.ts`
- `src/app/(site)/football/merchandise/checkout/success/page.tsx`
- `src/app/(site)/football/merchandise/checkout/cancel/page.tsx`
- `src/app/api/webhooks/stripe/route.ts`

### Modified Files

- `src/sanity/schema/index.ts` — register product + productCategory schemas
- `src/lib/content/index.ts` — export product queries
- `src/lib/config.ts` — add Stripe config schema
- `src/app/(site)/football/merchandise/page.tsx` — replace static page with product catalogue
- `src/app/(site)/layout.tsx` — wrap with CartProvider
- Site navbar component — add CartIcon
- `.env.example` — add Stripe env vars
- `src/lib/routes.ts` — add product detail route

## Key Design Decisions

- **Hosted Checkout over Embedded**: simpler, no PCI concerns, Stripe handles all payment UI. Trade-off: user leaves site briefly but returns to success page
- **localStorage cart over DB**: no user accounts needed, keeps it simple. Cart clears client-side on success page. Multi-tab sync via storage event listener
- **Price in cents in Sanity**: avoids floating-point issues, matches Stripe's expected format
- **Server action validates prices**: never trust client cart prices — re-fetch from Sanity before creating Stripe session
- **Guest checkout only**: no order history, no accounts. Email confirmation is the receipt

## Unresolved Questions

- Should sizes be defined per-product or as a global set in Sanity?
- Do we need a "coming soon" state for products not yet available?
- Shipping: flat rate, free pickup, or calculate by address? (deferred to phase 2)
- Stock management: manual toggle in Sanity or decrement on purchase via webhook?
- Do we want product variants (e.g. different prices for youth vs adult sizes)?
