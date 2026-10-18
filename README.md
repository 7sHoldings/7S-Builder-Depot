# 7S Builder Depot

Online storefront for **7S Builder Depot** — vinyl flooring, doors, windows and tile in Kerens, TX.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4.

## What's included

| Page | URL | What it does |
| --- | --- | --- |
| Home | `/` | Hero, shop by category, services, featured products, quick quote form |
| Category | `/shop/vinyl`, `/shop/doors`, `/shop/windows`, `/shop/tile` | Filter by type, in-stock only, sort by price or name |
| Product | `/product/[slug]` | Color picker, coverage calculator (sq ft → boxes), quantity, add to cart, specs |
| Cart | `/cart` | Change quantities, remove items, pickup vs. delivery, tax and totals |
| Checkout | `/checkout` | Contact, pickup/delivery with date, payment method, place order |
| Order placed | `/order-confirmed` | Order number and summary |
| Quote request | `/quote` | 4-step form: project → details → contact → done |
| Search | `/search?q=…` | Searches product names, SKUs and types |

The cart is saved in the visitor's browser, so it survives page reloads.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other commands:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # check the code
```

## Put it online (free)

The easiest host is [Vercel](https://vercel.com) (made by the Next.js team):

1. Sign in to Vercel with your GitHub account.
2. Click **Add New → Project** and pick the `7S-Builder-Depot` repo.
3. Click **Deploy**. No settings to change.

Every push to `main` will update the live site automatically. You can connect your own domain in the Vercel project settings.

## Where to change things

| To change… | Edit this file |
| --- | --- |
| Phone, email, address, hours, delivery fee, tax rate | `src/lib/site.ts` |
| Products, prices, stock, specs, colors | `src/lib/catalog.ts` |
| Brand colors and fonts | `src/app/globals.css` (the `@theme` block) |
| Home page sections | `src/app/page.tsx` |
| Header / footer | `src/components/Header.tsx`, `src/components/Footer.tsx` |

**Sample data:** product prices, stock counts and store hours are examples. Replace them before launch.

**Product photos:** products currently show drawn illustrations (`src/components/ProductVisual.tsx`). To use real photos, put the images in `public/products/`, add an `image` field to each product in `catalog.ts`, and render it with `next/image` in `ProductCard.tsx` and `ProductDetail.tsx`.

## How orders and quotes reach you (for now)

The site doesn't have a server-side database or payment processor yet. When a customer places an order or sends a quote request, the site opens **their email app** with everything filled in, addressed to `7sbuilderdepot@gmail.com`. They press Send, and you receive it by email. Customers pay at pickup or on delivery (or by Pro account invoice). No card details are collected online.

## Next steps

These are the natural upgrades, roughly in order:

1. **Send quotes and orders automatically** — add a Next.js Route Handler (for example `src/app/api/quote/route.ts`) that emails you using a service like Resend or SendGrid, instead of opening the customer's email app.
2. **Online card payments** — add Stripe Checkout.
3. **Product database + admin** — move products from `catalog.ts` into a database (for example Postgres on Vercel or Supabase) with an admin page to edit prices and stock.
4. **Pro accounts** — sign-in for contractors with their own pricing and order history.

## Project structure

```
src/
  app/            Pages (one folder per URL)
  components/     Reusable UI pieces
  lib/            Store info, catalog, cart, totals, helpers
```

> Note for developers and coding agents: this project uses Next.js 16 with Cache Components enabled. See `AGENTS.md` and the docs bundled in `node_modules/next/dist/docs/`.
