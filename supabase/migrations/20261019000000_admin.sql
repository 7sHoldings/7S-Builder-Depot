-- 7S Builder Depot — admin area: product photos uploaded from /admin.
-- Additive and safe to re-run.

create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  bytes        bytea not null,
  size         integer not null check (size > 0 and size <= 5242880),
  width        integer,
  height       integer,
  created_at   timestamptz not null default now()
);

alter table public.media enable row level security;
revoke all on public.media from anon, authenticated;
