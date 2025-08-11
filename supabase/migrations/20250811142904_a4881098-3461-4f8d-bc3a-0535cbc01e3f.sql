
-- 1) Roles
create type if not exists public.app_role as enum ('admin', 'user');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

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

-- Allow users to read their own roles
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_roles' and policyname = 'Users can view their roles'
  ) then
    create policy "Users can view their roles"
      on public.user_roles
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- Allow admins to manage all roles (insert/update/delete/select)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_roles' and policyname = 'Admins can manage all roles'
  ) then
    create policy "Admins can manage all roles"
      on public.user_roles
      for all
      to authenticated
      using (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;
end $$;

-- Optionally let users self-assign the 'user' role (not required, but harmless)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_roles' and policyname = 'Users can self-assign user role'
  ) then
    create policy "Users can self-assign user role"
      on public.user_roles
      for insert
      to authenticated
      with check (auth.uid() = user_id and role = 'user');
  end if;
end $$;

-- 2) Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2),
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Public read access
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Public read access to products'
  ) then
    create policy "Public read access to products"
      on public.products
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- Admin-only writes
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Admins can insert products'
  ) then
    create policy "Admins can insert products"
      on public.products
      for insert
      to authenticated
      with check (public.has_role(auth.uid(), 'admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Admins can update products'
  ) then
    create policy "Admins can update products"
      on public.products
      for update
      to authenticated
      using (public.has_role(auth.uid(), 'admin'))
      with check (public.has_role(auth.uid(), 'admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Admins can delete products'
  ) then
    create policy "Admins can delete products"
      on public.products
      for delete
      to authenticated
      using (public.has_role(auth.uid(), 'admin'));
  end if;
end $$;

-- 3) Storage bucket for product images
-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
select 'product-images', 'product-images', true
where not exists (
  select 1 from storage.buckets where id = 'product-images'
);

-- Public read for objects in product-images
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read access to product-images'
  ) then
    create policy "Public read access to product-images"
      on storage.objects
      for select
      to anon, authenticated
      using (bucket_id = 'product-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can upload product images'
  ) then
    create policy "Admins can upload product images"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can update product images'
  ) then
    create policy "Admins can update product images"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'))
      with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can delete product images'
  ) then
    create policy "Admins can delete product images"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
  end if;
end $$;
