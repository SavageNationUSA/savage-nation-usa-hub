import { SEO } from "@/components/SEO";

const Store = () => {
  return (
    <main className="container mx-auto py-10">
      <SEO title="Store — Savage Nation USA" description="Shop patriotic apparel and gear from Savage Nation USA." />
      <h1 className="text-4xl font-bold mb-6">Store</h1>
      <p className="text-muted-foreground mb-8">Our full e‑commerce experience is coming soon. Browse featured products below.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="rounded-lg border p-6 shadow-sm hover:shadow-elevated transition-shadow">
            <div className="aspect-[4/3] bg-muted rounded-md mb-4" />
            <div className="font-medium">Patriotic Tee {i}</div>
            <div className="text-muted-foreground text-sm">Premium cotton blend</div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Store;
