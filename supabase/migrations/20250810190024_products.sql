-- Migration for products table and policies
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  price numeric,
  image_url text,
  created_at timestamptz default now()
);

alter table products enable row level security;

create policy "Public read access on products" on products
  for select
  using (true);

create policy "Only admin can insert products" on products
  for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admin can update products" on products
  for update
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admin can delete products" on products
  for delete
  using (auth.jwt() ->> 'role' = 'admin');
