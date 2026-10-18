-- 7S Builder Depot — initial schema
-- Products, orders (with line items) and quote requests.
--
-- Security: Row Level Security is ON for every table with NO policies, so the
-- public Supabase API (anon / authenticated keys) cannot read or write anything.
-- Only the website's server, which connects with DATABASE_URL, can access the data.

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- products
create table public.products (
  slug          text primary key check (slug ~ '^[a-z0-9-]+$'),
  sku           text not null unique,
  name          text not null,
  category      text not null check (category in ('vinyl', 'doors', 'windows', 'tile')),
  type          text not null,
  price         numeric(10, 2) not null check (price >= 0),          -- per sq ft when unit = 'sqft'
  unit          text not null check (unit in ('sqft', 'each')),
  sqft_per_box  numeric(8, 2) check (sqft_per_box is null or sqft_per_box > 0),
  summary       text not null default '',
  description   text not null default '',
  specs         jsonb not null default '[]'::jsonb,                  -- [["Label", "Value"], ...]
  colors        jsonb,                                               -- [{"name": "...", "hex": "#..."}]
  visual        jsonb not null,                                      -- drawing used until photos exist
  image_url     text,
  stock         integer not null default 0 check (stock >= 0),
  featured      boolean not null default false,
  active        boolean not null default true,                       -- false = hidden from the site
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (unit = 'each' or sqft_per_box is not null)
);

create index products_category_idx on public.products (category, sort_order) where active;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- orders
create sequence public.order_number_seq start 100001;

create table public.orders (
  id               bigint generated always as identity primary key,
  order_number     text not null unique default ('7S-' || nextval('public.order_number_seq')),
  status           text not null default 'new'
                   check (status in ('new', 'confirmed', 'ready', 'completed', 'cancelled')),
  customer_name    text not null,
  phone            text not null,
  email            text not null,
  fulfillment      text not null check (fulfillment in ('pickup', 'delivery')),
  delivery_address text,
  requested_date   text,
  payment_method   text not null,
  notes            text,
  subtotal         numeric(10, 2) not null,
  delivery_fee     numeric(10, 2) not null default 0,
  tax              numeric(10, 2) not null,
  total            numeric(10, 2) not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (fulfillment = 'pickup' or delivery_address is not null)
);

create index orders_status_idx on public.orders (status, created_at desc);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id            bigint generated always as identity primary key,
  order_id      bigint not null references public.orders (id) on delete cascade,
  product_slug  text references public.products (slug) on delete set null,
  sku           text not null,
  name          text not null,
  color         text,
  unit_label    text not null,
  unit_price    numeric(10, 2) not null,
  quantity      integer not null check (quantity > 0),
  line_total    numeric(10, 2) not null
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_slug);

-- ---------------------------------------------------------------- quote requests
create sequence public.quote_number_seq start 20001;

create table public.quote_requests (
  id                bigint generated always as identity primary key,
  reference         text not null unique default ('Q-' || nextval('public.quote_number_seq')),
  status            text not null default 'new'
                    check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  name              text not null,
  company           text,
  phone             text not null,
  email             text,
  customer_type     text,
  materials         text[] not null default '{}',
  area_sqft         numeric(10, 2),
  door_window_count integer,
  timeline          text,
  zip               text,
  details           text,
  source            text not null default 'quote_form',            -- 'quote_form' or 'home_page'
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index quote_requests_status_idx on public.quote_requests (status, created_at desc);

create trigger quote_requests_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- security
alter table public.products       enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.quote_requests enable row level security;

revoke all on public.products, public.orders, public.order_items, public.quote_requests from anon, authenticated;
revoke all on sequence public.order_number_seq, public.quote_number_seq from anon, authenticated;
