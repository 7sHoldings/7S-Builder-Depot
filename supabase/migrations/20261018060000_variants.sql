-- 7S Builder Depot — product variants (sizes / swing), photos, price on request.
-- Additive: safe to apply while the previous version of the site is running.

-- Products: price can be empty ("price on request"), photos, optional stock tracking
alter table public.products alter column price drop not null;
alter table public.products add column if not exists price_note text;           -- e.g. 'Price on request'
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products alter column stock drop not null;                   -- null = not tracked
alter table public.products alter column stock drop default;

-- Variants: one row per sellable size (and swing for doors)
create table if not exists public.product_variants (
  id           text primary key check (id ~ '^[a-z0-9-]+$'),
  product_slug text not null references public.products (slug) on delete cascade,
  sku          text not null unique,
  label        text not null,                                   -- e.g. 30" × 80" · Right-hand
  width_in     numeric(6, 2),
  height_in    numeric(6, 2),
  swing        text check (swing in ('RH', 'LH')),
  stock        integer check (stock is null or stock >= 0),     -- null = not tracked
  price        numeric(10, 2) check (price is null or price >= 0), -- overrides the product price
  image        text,
  sort_order   integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists product_variants_product_idx on public.product_variants (product_slug, sort_order) where active;

drop trigger if exists product_variants_updated_at on public.product_variants;
create trigger product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

alter table public.product_variants enable row level security;
revoke all on public.product_variants from anon, authenticated;

-- Orders remember which size/swing was bought
alter table public.order_items add column if not exists variant_id text;
alter table public.order_items add column if not exists variant_label text;
