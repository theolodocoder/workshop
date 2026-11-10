-- FIX 3: the server sets the price. Shoppers can no longer write orders directly;
-- checkout calls place_order, which prices every line from the products table.

drop policy "insert own orders" on public.orders;
drop policy "insert items into own orders" on public.order_items;

create function public.place_order(items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  shopper uuid := auth.uid();
  new_order uuid;
  line jsonb;
  unit_price integer;
  line_qty integer;
  total integer := 0;
begin
  if shopper is null then
    raise exception 'not_signed_in';
  end if;

  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 or jsonb_array_length(items) > 20 then
    raise exception 'invalid_cart';
  end if;

  -- At most 5 orders per shopper per hour, so a demo visitor can't flood the database.
  if (select count(*) from orders where user_id = shopper and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;

  insert into orders (user_id, total_cents) values (shopper, 0) returning id into new_order;

  for line in select * from jsonb_array_elements(items) loop
    line_qty := (line ->> 'qty')::integer;
    if line_qty is null or line_qty < 1 or line_qty > 10 then
      raise exception 'invalid_cart';
    end if;

    -- The price comes from our table. Any price the browser sends is ignored.
    select price_cents into unit_price from products where id = line ->> 'product_id';
    if unit_price is null then
      raise exception 'invalid_cart';
    end if;

    insert into order_items (order_id, product_id, qty, unit_price_cents)
    values (new_order, line ->> 'product_id', line_qty, unit_price)
    on conflict (order_id, product_id) do update set qty = order_items.qty + excluded.qty;
    total := total + unit_price * line_qty;
  end loop;

  update orders set total_cents = total where id = new_order;
  return new_order;
end;
$$;

-- Only signed-in shoppers (including anonymous demo shoppers) may call it.
revoke execute on function public.place_order(jsonb) from public, anon;
grant execute on function public.place_order(jsonb) to authenticated;
