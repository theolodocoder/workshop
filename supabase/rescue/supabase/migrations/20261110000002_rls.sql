-- FIX 1: row-level security. Every table is locked by default; we only open what each role needs.
-- The before stack never gets this migration (that's the planted problem).

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Products are a public catalog: anyone can read them, nobody can write them through the API.
create policy "products are readable by everyone"
  on public.products for select
  to anon, authenticated
  using (true);

-- A shopper sees only their own profile.
create policy "own profile only"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- A shopper sees only their own orders. No update or delete policies, so nobody can change an order.
create policy "own orders only"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- For now a shopper may insert only orders that belong to them. Fix 3 removes direct inserts
-- entirely and creates orders through a server-side function that sets the price.
create policy "insert own orders"
  on public.orders for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Order items are visible, and insertable, only through an order you own.
create policy "items of own orders only"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );

create policy "insert items into own orders"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );
