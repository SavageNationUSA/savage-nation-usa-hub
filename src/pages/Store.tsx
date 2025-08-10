import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
};

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase!
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
};

const Store = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["store-products"],
    queryFn: fetchProducts,
  });

  return (
    <main className="container mx-auto py-10">
      <SEO
        title="Store — Savage Nation USA"
        description="Shop patriotic apparel and gear from Savage Nation USA."
      />
      <h1 className="text-4xl font-bold mb-6">Store</h1>
      {isLoading ? (
        <p className="text-muted-foreground mb-8">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border p-6 shadow-sm hover:shadow-elevated transition-shadow"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="mb-4 aspect-[4/3] w-full object-cover rounded-md"
                />
              )}
              <div className="font-medium">{product.name}</div>
              <div className="text-muted-foreground text-sm">
                {product.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Store;
