-- Migration for videos table and policies
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null,
  published boolean default false,
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;

-- Public can read published videos
create policy "Public can read published videos"
  on public.videos
  for select
  to public
  using (published = true);

-- Admins can read all videos
create policy "Admins can read all videos"
  on public.videos
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Only admins can write
create policy "Admins can insert videos"
  on public.videos
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update videos"
  on public.videos
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete videos"
  on public.videos
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
