-- Create the product-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create RLS policies for the product-images bucket
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Populate the pages table with initial pages
INSERT INTO public.pages (slug, title, content) VALUES
  ('about', 'About Us', 'Learn about our story, mission, and values.'),
  ('contact', 'Contact Us', 'Get in touch with the Savage Nation USA team.'),
  ('gallery', 'Gallery', 'Explore our gallery of patriotic imagery and community moments.'),
  ('story', 'Our Story', 'The origin and journey of Savage Nation USA.'),
  ('charities', 'Charities', 'Veteran-focused charities we support and partner with.'),
  ('mission', 'Our Mission', 'Our mission: honor service, unite communities, and give back.'),
  ('toolshed', 'Toolshed', 'Resources, downloads, and tools from Savage Nation USA.')
ON CONFLICT (slug) DO NOTHING;