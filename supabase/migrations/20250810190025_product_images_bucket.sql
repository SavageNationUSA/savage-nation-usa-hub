-- Migration for product-images bucket and policies
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read access on product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admin manage product images" on storage.objects
  for all using ((auth.jwt() ->> 'role' = 'admin') and bucket_id = 'product-images')
  with check ((auth.jwt() ->> 'role' = 'admin') and bucket_id = 'product-images');
