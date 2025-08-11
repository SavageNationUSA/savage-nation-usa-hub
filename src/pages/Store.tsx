
import { SEO } from "@/components/SEO";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
};

const Store = () => {
  const { data, isLoading, error } = useQuery<Product[]>({ queryKey: ["products"], queryFn: fetchProducts });

  return (
    <main className="container mx-auto py-10">
      <SEO
        title="Store — Savage Nation USA"
        description="Shop patriotic apparel and gear from Savage Nation USA."
      />
      <h1 className="text-4xl font-bold mb-6">Store</h1>
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border p-6 shadow-sm hover:shadow-elevated transition-shadow"
            >
              <Skeleton className="mb-4 aspect-[4/3] w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-destructive mb-8">Failed to load products.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Store;
