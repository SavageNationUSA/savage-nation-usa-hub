import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

const fetchGalleryImages = async (): Promise<GalleryImage[]> => {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const Gallery = () => {
  const { data: images, isLoading, error } = useQuery({
    queryKey: ["galleryImages"],
    queryFn: fetchGalleryImages,
  });

  return (
    <main className="container mx-auto py-10">
      <SEO
        title="Gallery — Savage Nation USA"
        description="Explore our gallery of patriotic imagery and community moments."
      />
      <h1 className="text-4xl font-bold mb-6">Gallery</h1>

      {isLoading && <p className="text-muted-foreground">Loading gallery...</p>}
      {error && (
        <p className="text-destructive">
          Error loading gallery: {error instanceof Error ? error.message : String(error)}
        </p>
      )}

      {images && images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={image.image_url}
                  alt={image.caption || "Gallery image"}
                  className="w-full h-64 object-cover"
                />
              </CardContent>
              {image.caption && (
                <CardFooter className="p-4">
                  <p className="text-sm text-center w-full">{image.caption}</p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && !error && <p className="text-muted-foreground">The gallery is currently empty. Check back soon!</p>
      )}
    </main>
  );
};

export default Gallery;
