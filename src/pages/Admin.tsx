import { SEO } from "@/components/SEO";

const Admin = () => {
  return (
    <>
      <SEO title="Admin — Savage Nation USA" description="Admin dashboard to manage Savage Nation USA." />
      <main className="container mx-auto py-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-6">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome, admin. Manage products, content, media, and blog posts here. (Coming soon)</p>
      </main>
    </>
  );
};

export default Admin;
