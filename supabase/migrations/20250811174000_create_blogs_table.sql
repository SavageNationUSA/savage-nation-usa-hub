-- Migration for blogs table and policies
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  published boolean default false,
  created_at timestamptz not null default now()
);

alter table public.blogs enable row level security;

-- Public can read published blogs
create policy "Public can read published blogs"
  on public.blogs
  for select
  to public
  using (published = true);

-- Admins can read all blogs
create policy "Admins can read all blogs"
  on public.blogs
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Only admins can write
create policy "Admins can insert blogs"
  on public.blogs
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update blogs"
  on public.blogs
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete blogs"
  on public.blogs
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
