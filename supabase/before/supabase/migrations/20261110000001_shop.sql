-- Northfold Outfitters shop schema.
-- Same in both stacks at first. The rescue stack adds row-level security in a later migration;
-- the before stack never does (that's the planted problem).

create table public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  price_cents integer not null check (price_cents > 0),
  description text not null,
  image_file text not null
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'placed',
  total_cents integer not null,
  created_at timestamptz not null default now()
);

create table public.order_items (
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  qty integer not null,
  unit_price_cents integer not null,
  primary key (order_id, product_id)
);

create index orders_user_id_idx on public.orders (user_id);
