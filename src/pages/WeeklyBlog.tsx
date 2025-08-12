import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type Blog = {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  created_at: string;
};

const fetchPublishedBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Blog[];
};

const WeeklyBlog = () => {
  const {
    data: blogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["publishedBlogs"],
    queryFn: fetchPublishedBlogs,
  });

  return (
    <main className="container mx-auto py-10">
      <SEO
        title="Weekly Blog — Savage Nation USA"
        description="Weekly stories, updates, and highlights from the community."
      />
      <h1 className="text-4xl font-bold mb-6">Weekly Blog</h1>

      {isLoading && <p className="text-muted-foreground">Loading posts...</p>}
      {error && (
        <p className="text-destructive">
          Error loading posts: {error instanceof Error ? error.message : String(error)}
        </p>
      )}

      {blogs && blogs.length > 0 ? (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader>
                <CardTitle>{blog.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{blog.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <p className="text-muted-foreground">
            No blog posts yet. Check back soon!
          </p>
        )
      )}
    </main>
  );
};

export default WeeklyBlog;
