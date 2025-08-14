-- Create gallery_images table
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gallery-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', TRUE);

-- Add row-level security policies for gallery_images table
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to gallery images"
ON gallery_images
FOR SELECT
USING (true);

CREATE POLICY "Allow admin full access to gallery images"
ON gallery_images
FOR ALL
USING (auth.role() = 'authenticated'); -- Assuming you have an admin role check in your app logic

-- Add row-level security policies for gallery-images storage bucket
CREATE POLICY "Allow public read access to gallery images bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Allow admin full access to gallery images bucket"
ON storage.objects
FOR ALL
USING (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');
