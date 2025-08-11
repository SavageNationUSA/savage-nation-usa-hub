
-- Enable gen_random_uuid if not already available
create extension if not exists pgcrypto with schema public;

-- 1) Roles: enum + user_roles table
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role' and n.nspname = 'public'
  ) then
    create type public.app_role as enum ('admin', 'moderator', 'user');
  end if;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Allow logged-in users to read their own roles
drop policy if exists "Users can read their own roles" on public.user_roles;
create policy "Users can read their own roles"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

-- 2) Security definer function to check roles (safe to use in RLS policies)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- 3) Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer, -- store price in whole dollars; adjust later if you prefer cents/decimals
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Public can read products
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products
  for select
  to public
  using (true);

-- Only admins can write
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 4) Make your two existing users admins
insert into public.user_roles (user_id, role) values
  ('5c3bf62b-fd06-4d3b-a3cb-9a0c806b44c0', 'admin'),
  ('9efed076-6cff-4c8f-9900-eb1e34535c1c', 'admin')
on conflict (user_id, role) do nothing;
