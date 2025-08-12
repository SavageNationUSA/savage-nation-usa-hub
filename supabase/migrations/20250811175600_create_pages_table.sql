-- Migration for pages table and policies
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text,
  updated_at timestamptz not null default now()
);

-- Function to update the updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update the updated_at column on every update
create trigger update_pages_updated_at
  before update
  on public.pages
  for each row
  execute function public.update_updated_at_column();

alter table public.pages enable row level security;

-- Public can read pages
create policy "Public can read pages"
  on public.pages
  for select
  to public
  using (true);

-- Admins can manage pages
create policy "Admins can insert pages"
  on public.pages
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update pages"
  on public.pages
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete pages"
  on public.pages
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Seed initial pages
insert into public.pages (slug, title, content) values
  ('about', 'About Us', 'Default content for About Us page. Please edit in the admin panel.'),
  ('charities', 'Charities', 'Default content for Charities page. Please edit in the admin panel.'),
  ('contact', 'Contact Us', 'Default content for Contact Us page. Please edit in the admin panel.'),
  ('faq', 'FAQ', 'Default content for FAQ page. Please edit in the admin panel.'),
  ('gallery', 'Gallery', 'Default content for Gallery page. Please edit in the admin panel.'),
  ('mission', 'Our Mission', 'Default content for Our Mission page. Please edit in the admin panel.'),
  ('story', 'Our Story', 'Default content for Our Story page. Please edit in the admin panel.'),
  ('toolshed', 'The Toolshed', 'Default content for The Toolshed page. Please edit in the admin panel.')
on conflict (slug) do nothing;
