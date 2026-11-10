-- Daily limits for the "check your site" feature: 3 checks per visitor and 200 in total per UTC day.
-- The counters can only be touched through take_check_quota(); nobody can read or edit them directly.

create table public.check_usage (
  day date not null,
  visitor_hash text not null,
  count integer not null default 0,
  primary key (day, visitor_hash)
);

create table public.check_global (
  day date primary key,
  count integer not null default 0
);

alter table public.check_usage enable row level security;
alter table public.check_global enable row level security;
revoke all on public.check_usage, public.check_global from anon, authenticated;

create function public.take_check_quota(visitor_hash text)
returns text
language plpgsql
security definer
set search_path = public
as $$
-- Bare "visitor_hash" means the column; the parameter is always written take_check_quota.visitor_hash.
#variable_conflict use_column
declare
  today date := (now() at time zone 'utc')::date;
  mine integer;
  everyone integer;
begin
  if take_check_quota.visitor_hash is null or length(take_check_quota.visitor_hash) not between 8 and 128 then
    raise exception 'invalid_visitor';
  end if;

  -- Lock today's global row so two checks at the same moment can't both slip past the cap.
  insert into check_global (day, count) values (today, 0) on conflict (day) do nothing;
  select count into everyone from check_global where day = today for update;
  if everyone >= 200 then
    return 'global_limit';
  end if;

  insert into check_usage (day, visitor_hash, count) values (today, take_check_quota.visitor_hash, 0)
  on conflict (day, visitor_hash) do nothing;
  select count into mine from check_usage
  where day = today and check_usage.visitor_hash = take_check_quota.visitor_hash for update;
  if mine >= 3 then
    return 'visitor_limit';
  end if;

  update check_usage set count = count + 1 where day = today and check_usage.visitor_hash = take_check_quota.visitor_hash;
  update check_global set count = count + 1 where day = today;
  return 'ok';
end;
$$;

revoke execute on function public.take_check_quota(text) from public;
grant execute on function public.take_check_quota(text) to anon, authenticated;
