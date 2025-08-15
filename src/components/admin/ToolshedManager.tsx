import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ToolshedResource } from "@/hooks/useToolshedResources";

export const ToolshedManager = () => {
  const [resources, setResources] = useState<ToolshedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<ToolshedResource | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tools',
    type: 'tool' as 'link' | 'download' | 'tool' | 'image',
    url: '',
    file_url: '',
    tags: '',
    featured: false,
    display_order: 0
  });

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('toolshed_resources')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Tools',
      type: 'tool',
      url: '',
      file_url: '',
      tags: '',
      featured: false,
      display_order: 0
    });
    setEditingResource(null);
  };

  const handleEdit = (resource: ToolshedResource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      type: resource.type,
      url: resource.url || '',
      file_url: resource.file_url || '',
      tags: resource.tags ? resource.tags.join(', ') : '',
      featured: resource.featured,
      display_order: resource.display_order
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('toolshed-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('toolshed-files')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, file_url: data.publicUrl }));
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const resourceData = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        type: formData.type,
        url: formData.url || null,
        file_url: formData.file_url || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        featured: formData.featured,
        display_order: formData.display_order
      };

      if (editingResource) {
        const { error } = await supabase
          .from('toolshed_resources')
          .update(resourceData)
          .eq('id', editingResource.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Resource updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('toolshed_resources')
          .insert([resourceData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Resource created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: "Error",
        description: "Failed to save resource",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('toolshed_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
      
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Toolshed Resources</h2>
          <p className="text-muted-foreground">Manage tools, downloads, and links</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </DialogTitle>
              <DialogDescription>
                {editingResource ? 'Update the resource details' : 'Create a new toolshed resource'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">External URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                {formData.file_url && (
                  <p className="text-sm text-muted-foreground">File uploaded: {formData.file_url}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Resource</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingResource ? 'Update' : 'Create'} Resource
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resources List */}
      <div className="grid gap-4">
        {loading ? (
          <div>Loading resources...</div>
        ) : resources.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No resources found. Create your first resource!</p>
            </CardContent>
          </Card>
        ) : (
          resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {resource.title}
                      {resource.featured && <Badge>Featured</Badge>}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{resource.category}</Badge>
                      <Badge variant="secondary">{resource.type}</Badge>
                      <span>• {resource.download_count} accesses</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(resource)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(resource.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {resource.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};