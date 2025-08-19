-- Create toolshed_resources table
CREATE TABLE public.toolshed_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Tools',
  type TEXT NOT NULL CHECK (type IN ('link', 'download', 'tool', 'image')),
  url TEXT,
  file_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.toolshed_resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read all toolshed resources" 
ON public.toolshed_resources 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert toolshed resources" 
ON public.toolshed_resources 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update toolshed resources" 
ON public.toolshed_resources 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete toolshed resources" 
ON public.toolshed_resources 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for toolshed files
INSERT INTO storage.buckets (id, name, public) VALUES ('toolshed-files', 'toolshed-files', true);

-- Create policies for toolshed-files bucket
CREATE POLICY "Toolshed files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'toolshed-files');

CREATE POLICY "Admins can upload toolshed files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'toolshed-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update toolshed files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'toolshed-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete toolshed files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'toolshed-files' AND has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_toolshed_resources_updated_at
BEFORE UPDATE ON public.toolshed_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();