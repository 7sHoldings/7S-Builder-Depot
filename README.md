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
| Products, prices, stock, specs, colors | Supabase → Table Editor → `products` (sample data lives in `src/lib/catalog.ts`) |
| Brand colors and fonts | `src/app/globals.css` (the `@theme` block) |
| Home page sections | `src/app/page.tsx` |
| Header / footer | `src/components/Header.tsx`, `src/components/Footer.tsx` |

**Sample data:** product prices, stock counts and store hours are examples. Replace them before launch.

**Product photos:** products currently show drawn illustrations (`src/components/ProductVisual.tsx`). To use real photos, put the images in `public/products/`, add an `image` field to each product in `catalog.ts`, and render it with `next/image` in `ProductCard.tsx` and `ProductDetail.tsx`.

## Database (Supabase)

Products, orders and quote requests are stored in a Supabase Postgres database.

| Table | What's in it |
| --- | --- |
| `products` | Every product: price, stock, specs, colors. Set `active` to false to hide one. |
| `orders` + `order_items` | Every order placed at checkout, with its line items. `status`: new → confirmed → ready → completed (or cancelled). |
| `quote_requests` | Every quote request. `status`: new → contacted → quoted → won / lost. |

**Day to day:** open your project at [supabase.com](https://supabase.com/dashboard) → **Table Editor** to see new orders and quote requests, change prices or stock, and update statuses. Product changes show on the site within an hour (or right away after a redeploy).

**Security:** Row Level Security is on for every table with no public access, so customer details can't be read through Supabase's public API. Only the website's server, using `DATABASE_URL`, can read or write.

**Prices are checked on the server.** The cart remembers prices for display, but when an order is placed the server re-prices every item from the database.

### Setting it up

1. In Supabase, run `supabase/migrations/20261018000000_init.sql`, then `supabase/seed.sql` (sample products). Both can be pasted into **SQL Editor**.
2. In Supabase → **Connect** → **Transaction pooler**, copy the connection string (port 6543) and put in your database password.
3. In Vercel → **Settings → Environment Variables**, add `DATABASE_URL` with that string, then redeploy.

To regenerate `supabase/seed.sql` after editing the sample catalog: `npm run db:seed-sql`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes (for the live site) | Supabase transaction-pooler connection string |
| `RESEND_API_KEY` | Optional | Email alerts for new orders and quotes, via [resend.com](https://resend.com) |
| `NOTIFY_EMAIL` | Optional | Where alerts go (default `7sbuilderdepot@gmail.com`) |
| `RESEND_FROM` | Optional | Sender address on a domain verified in Resend, e.g. `7S Builder Depot <orders@7sbuilderdepot.com>` |

Without `DATABASE_URL` (for example on your laptop), the site shows the sample catalog from `src/lib/catalog.ts`. Orders and quotes then go through the customer's email app instead of the database.

## Next steps

1. **Email alerts** — add `RESEND_API_KEY` so you get an email the moment an order or quote arrives.
2. **Admin page** — a password-protected page on the site to manage orders, quotes and products, so you don't need the Supabase dashboard.
3. **Online card payments** — add Stripe Checkout.
4. **Pro accounts** — sign-in for contractors with their own pricing and order history.

## Project structure

```
src/
  app/            Pages (one folder per URL)
  components/     Reusable UI pieces
  lib/            Store info, catalog, cart, totals, helpers
```

> Note for developers and coding agents: this project uses Next.js 16 with Cache Components enabled. See `AGENTS.md` and the docs bundled in `node_modules/next/dist/docs/`.
