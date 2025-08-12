import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Page = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  updated_at: string;
};

const fetchPage = async (slug: string): Promise<Page | null> => {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PostgREST error code for "Not a single row was found"
      console.warn(`Page with slug "${slug}" not found.`);
      return null;
    }
    throw error;
  }
  return data;
};

type GenericPageProps = {
  slug: string;
  title: string;
  description: string;
};

export const GenericPage = ({ slug, title, description }: GenericPageProps) => {
  const {
    data: page,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => fetchPage(slug),
  });

  return (
    <main className="container mx-auto py-10">
      <SEO title={`${title} — Savage Nation USA`} description={description} />
      <h1 className="text-4xl font-bold mb-6">{page?.title || title}</h1>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && (
        <p className="text-destructive">
          Error loading page: {error instanceof Error ? error.message : String(error)}
        </p>
      )}

      {page ? (
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{page.content || ""}</ReactMarkdown>
        </div>
      ) : (
        !isLoading && !error && <p className="text-muted-foreground">Content coming soon.</p>
      )}
    </main>
  );
};
