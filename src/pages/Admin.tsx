import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CrudTable } from "@/components/admin/CrudTable";
import { useOptimisticDelete } from "@/hooks/useOptimisticDelete";

// Product Types
type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
};

type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  image?: FileList;
};

// Blog Types
type Blog = {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  created_at: string;
};

type BlogFormValues = {
  title: string;
  content: string;
  published: boolean;
};

// Video Types
type Video = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  published: boolean;
  created_at: string;
};

type VideoFormValues = {
  title: string;
  description: string;
  url: string;
  published: boolean;
};

// Page Types
type Page = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  updated_at: string;
};

type PageFormValues = {
  title: string;
  content: string;
};

// FAQ Types
type Faq = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
};

type FaqFormValues = {
  question: string;
  answer: string;
  display_order: string;
};

// Data Fetching
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
};

const fetchBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Blog[];
};

const fetchVideos = async (): Promise<Video[]> => {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Video[];
};

const fetchPages = async (): Promise<Page[]> => {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("slug", { ascending: true });
  if (error) throw error;
  return data as Page[];
};

const fetchFaqs = async (): Promise<Faq[]> => {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data as Faq[];
};

// Product Components
const CreateProductDialog = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<ProductFormValues>({
    defaultValues: { name: "", description: "", price: "", image: undefined },
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      let imageUrl: string | null = null;
      if (values.image && values.image[0]) {
        const file = values.image[0];
        const filePath = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase
          .storage.from("product-images")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
      const { error } = await supabase.from("products").insert({
        name: values.name,
        description: values.description,
        price: values.price ? Number(values.price) : null,
        image_url: imageUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created" });
      form.reset();
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const EditProductDialog = ({ product }: { product: Product }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<ProductFormValues>({
    defaultValues: {
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price?.toString() ?? "",
      image: undefined,
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price?.toString() ?? "",
      image: undefined,
    });
  }, [product, form]);

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      let imageUrl = product.image_url;
      if (values.image && values.image[0]) {
        const file = values.image[0];
        const filePath = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase
          .storage.from("product-images")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath);
        imageUrl = publicUrl;
      }
      const { error } = await supabase
        .from("products")
        .update({
          name: values.name,
          description: values.description,
          price: values.price ? Number(values.price) : null,
          image_url: imageUrl,
        })
        .eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated" });
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const ProductsManager = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const deleteMutation = useOptimisticDelete<Product>({
    queryKey: ["products"],
    deleteFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Product deleted" });
    },
  });

  return (
    <CrudTable
      title="Products"
      isLoading={isLoading}
      items={data}
      toolbar={<CreateProductDialog />}
      headers={["Image", "Name", "Description", "Price", <span className="text-right block" key="actions">Actions</span>]}
      renderRow={(product: Product) => (
        <TableRow key={product.id}>
          <TableCell>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-16 w-16 object-cover rounded"
              />
            ) : null}
          </TableCell>
          <TableCell className="font-medium">{product.name}</TableCell>
          <TableCell>{product.description}</TableCell>
          <TableCell>
            {product.price != null ? `$${product.price}` : ""}
          </TableCell>
          <TableCell className="text-right space-x-2">
            <EditProductDialog product={product} />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(product.id)}
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>
      )}
    />
  );
};

// Blog Components
const CreateBlogDialog = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<BlogFormValues>({
    defaultValues: { title: "", content: "", published: false },
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: BlogFormValues) => {
      const { error } = await supabase.from("blogs").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast({ title: "Blog post created" });
      form.reset();
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Blog Post</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Blog Post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const EditBlogDialog = ({ blog }: { blog: Blog }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<BlogFormValues>({
    defaultValues: {
      title: blog.title ?? "",
      content: blog.content ?? "",
      published: blog.published ?? false,
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({
      title: blog.title ?? "",
      content: blog.content ?? "",
      published: blog.published ?? false,
    });
  }, [blog, form]);

  const mutation = useMutation({
    mutationFn: async (values: BlogFormValues) => {
      const { error } = await supabase
        .from("blogs")
        .update(values)
        .eq("id", blog.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast({ title: "Blog post updated" });
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Blog Post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={10} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const BlogsManager = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
  });

  const deleteMutation = useOptimisticDelete<Blog>({
    queryKey: ["blogs"],
    deleteFn: async (id: string) => {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Blog post deleted" });
    },
  });

  return (
    <CrudTable
      title="Blog Posts"
      isLoading={isLoading}
      items={data}
      toolbar={<CreateBlogDialog />}
      headers={["Title", "Status", "Created At", <span className="text-right block" key="actions">Actions</span>]}
      renderRow={(blog: Blog) => (
        <TableRow key={blog.id}>
          <TableCell className="font-medium">{blog.title}</TableCell>
          <TableCell>
            <Badge variant={blog.published ? "default" : "secondary"}>
              {blog.published ? "Published" : "Draft"}
            </Badge>
          </TableCell>
          <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
          <TableCell className="text-right space-x-2">
            <EditBlogDialog blog={blog} />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(blog.id)}
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>
      )}
    />
  );
};

// Video Components
const CreateVideoDialog = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<VideoFormValues>({
    defaultValues: { title: "", description: "", url: "", published: false },
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: VideoFormValues) => {
      const { error } = await supabase.from("videos").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({ title: "Video created" });
      form.reset();
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Video</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Video</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://www.youtube.com/watch?v=..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const EditVideoDialog = ({ video }: { video: Video }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<VideoFormValues>({
    defaultValues: {
      title: video.title ?? "",
      description: video.description ?? "",
      url: video.url ?? "",
      published: video.published ?? false,
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({
      title: video.title ?? "",
      description: video.description ?? "",
      url: video.url ?? "",
      published: video.published ?? false,
    });
  }, [video, form]);

  const mutation = useMutation({
    mutationFn: async (values: VideoFormValues) => {
      const { error } = await supabase
        .from("videos")
        .update(values)
        .eq("id", video.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast({ title: "Video updated" });
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const VideosManager = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const deleteMutation = useOptimisticDelete<Video>({
    queryKey: ["videos"],
    deleteFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Video deleted" });
    },
  });

  return (
    <CrudTable
      title="Videos"
      isLoading={isLoading}
      items={data}
      toolbar={<CreateVideoDialog />}
      headers={["Title", "URL", "Status", <span className="text-right block" key="actions">Actions</span>]}
      renderRow={(video: Video) => (
        <TableRow key={video.id}>
          <TableCell className="font-medium">{video.title}</TableCell>
          <TableCell><a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{video.url}</a></TableCell>
          <TableCell>
            <Badge variant={video.published ? "default" : "secondary"}>
              {video.published ? "Published" : "Draft"}
            </Badge>
          </TableCell>
          <TableCell className="text-right space-x-2">
            <EditVideoDialog video={video} />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(video.id)}
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>
      )}
    />
  );
};

// Page Components
const EditPageDialog = ({ page }: { page: Page }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<PageFormValues>({
    defaultValues: {
      title: page.title ?? "",
      content: page.content ?? "",
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({
      title: page.title ?? "",
      content: page.content ?? "",
    });
  }, [page, form]);

  const mutation = useMutation({
    mutationFn: async (values: PageFormValues) => {
      const { error } = await supabase
        .from("pages")
        .update({
          title: values.title,
          content: values.content,
        })
        .eq("id", page.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast({ title: "Page updated" });
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Page: {page.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={15} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const PagesManager = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: fetchPages,
  });

  return (
    <CrudTable
      title="Site Pages"
      isLoading={isLoading}
      items={data}
      headers={["Title", "Slug", "Last Updated", <span className="text-right block" key="actions">Actions</span>]}
      renderRow={(page: Page) => (
        <TableRow key={page.id}>
          <TableCell className="font-medium">{page.title}</TableCell>
          <TableCell className="font-mono text-xs">/{page.slug}</TableCell>
          <TableCell>{new Date(page.updated_at).toLocaleString()}</TableCell>
          <TableCell className="text-right space-x-2">
            <EditPageDialog page={page} />
          </TableCell>
        </TableRow>
      )}
    />
  );
};

const Admin = () => {
  return (
    <>
      <SEO
        title="Admin — Savage Nation USA"
        description="Admin dashboard to manage Savage Nation USA."
      />
      <main className="container mx-auto py-12">
        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>
          <TabsContent value="blogs">
            <BlogsManager />
          </TabsContent>
          <TabsContent value="videos">
            <VideosManager />
          </TabsContent>
          <TabsContent value="pages">
            <PagesManager />
          </TabsContent>
          <TabsContent value="faq">
            <FaqsManager />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

// FAQ Components
const CreateFaqDialog = () => {
  const [open, setOpen] = useState(false);
  const form = useForm<FaqFormValues>({
    defaultValues: { question: "", answer: "", display_order: "0" },
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: FaqFormValues) => {
      const { error } = await supabase.from("faqs").insert({
        ...values,
        display_order: Number(values.display_order)
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast({ title: "FAQ created" });
      form.reset();
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New FAQ</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create FAQ</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const EditFaqDialog = ({ faq }: { faq: Faq }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<FaqFormValues>({
    defaultValues: {
      question: faq.question ?? "",
      answer: faq.answer ?? "",
      display_order: faq.display_order?.toString() ?? "0",
    },
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({
      question: faq.question ?? "",
      answer: faq.answer ?? "",
      display_order: faq.display_order?.toString() ?? "0",
    });
  }, [faq, form]);

  const mutation = useMutation({
    mutationFn: async (values: FaqFormValues) => {
      const { error } = await supabase
        .from("faqs")
        .update({
          question: values.question,
          answer: values.answer,
          display_order: Number(values.display_order),
        })
        .eq("id", faq.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast({ title: "FAQ updated" });
      setOpen(false);
    },
    onError: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit FAQ</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const FaqsManager = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: fetchFaqs,
  });

  const deleteMutation = useOptimisticDelete<Faq>({
    queryKey: ["faqs"],
    deleteFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "FAQ deleted" });
    },
  });

  return (
    <CrudTable
      title="FAQ"
      isLoading={isLoading}
      items={data}
      toolbar={<CreateFaqDialog />}
      headers={["Order", "Question", "Answer", <span className="text-right block" key="actions">Actions</span>]}
      renderRow={(faq: Faq) => (
        <TableRow key={faq.id}>
          <TableCell>{faq.display_order}</TableCell>
          <TableCell className="font-medium">{faq.question}</TableCell>
          <TableCell>{faq.answer}</TableCell>
          <TableCell className="text-right space-x-2">
            <EditFaqDialog faq={faq} />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(faq.id)}
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>
      )}
    />
  );
};

export default Admin;
