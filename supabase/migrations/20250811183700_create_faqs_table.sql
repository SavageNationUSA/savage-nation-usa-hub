-- Migration for faqs table and policies
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer default 0,
  created_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

-- Public can read faqs
create policy "Public can read faqs"
  on public.faqs
  for select
  to public
  using (true);

-- Admins can manage faqs
create policy "Admins can insert faqs"
  on public.faqs
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update faqs"
  on public.faqs
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete faqs"
  on public.faqs
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Seed initial faqs
insert into public.faqs (question, answer, display_order) values
  ('How do you support veterans?', 'We donate a portion of proceeds and collaborate with vetted charities to support veterans and their families.', 1),
  ('When will the store be live?', 'The full checkout experience is coming soon. Join our newsletter to be notified.', 2),
  ('Do you ship internationally?', 'Yes, we plan to offer international shipping for select products.', 3)
on conflict (id) do nothing;
