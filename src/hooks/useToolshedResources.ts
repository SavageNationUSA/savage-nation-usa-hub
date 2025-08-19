import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ToolshedResource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: 'link' | 'download' | 'tool' | 'image';
  url: string | null;
  file_url: string | null;
  tags: string[];
  featured: boolean;
  download_count: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useToolshedResources = () => {
  const [resources, setResources] = useState<ToolshedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('toolshed_resources')
        .select('*')
        .order('featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching toolshed resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementDownloadCount = async (id: string) => {
    try {
      // Get current count and increment
      const { data: current, error: fetchError } = await supabase
        .from('toolshed_resources')
        .select('download_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('toolshed_resources')
        .update({ download_count: (current?.download_count || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setResources(prev => prev.map(resource => 
        resource.id === id 
          ? { ...resource, download_count: resource.download_count + 1 }
          : resource
      ));
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    loading,
    refetch: fetchResources,
    incrementDownloadCount
  };
};