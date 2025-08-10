import { Hero } from "@/components/site/Hero";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <SEO
        title="Savage Nation USA — Patriotic Apparel, Stories & Support"
        description="Patriotic gear, stories, videos, and support for veterans. Shop the store, explore our mission, and join our community."
      />
      <Hero />
      <main className="container mx-auto py-12 grid gap-12">
        <section className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>We Support Veterans</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              A portion of proceeds and our community efforts go directly to supporting veterans and their families.
            </CardContent>
          </Card>
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Stories & Weekly Blog</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Real stories of grit and resilience. Read the latest from our weekly blog.
            </CardContent>
          </Card>
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>Modern Patriotic Gear</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Premium materials, bold designs, and a mission-driven brand.
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <Button asChild variant="hero" size="xl">
            <Link to="/store">Explore the Store</Link>
          </Button>
        </section>
      </main>
    </>
  );
};

export default Index;
