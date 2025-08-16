import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type Video = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  published: boolean;
  created_at: string;
};

const fetchPublishedVideos = async (): Promise<Video[]> => {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Video[];
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    
    // Handle standard YouTube watch URLs
    if (urlObj.hostname === "www.youtube.com" && urlObj.pathname === "/watch") {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle YouTube Shorts URLs
    if ((urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") && urlObj.pathname.startsWith("/shorts/")) {
      const videoId = urlObj.pathname.split("/shorts/")[1]?.split("?")[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Handle youtu.be URLs
    if (urlObj.hostname === "youtu.be") {
        const videoId = urlObj.pathname.slice(1);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }
  } catch (error) {
    // Invalid URL, ignore
  }
  return null;
};

const Videos = () => {
  const {
    data: videos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["publishedVideos"],
    queryFn: fetchPublishedVideos,
  });

  return (
    <main className="container mx-auto py-10">
      <SEO
        title="Videos — Savage Nation USA"
        description="Watch patriotic videos, stories, and highlights."
      />
      <h1 className="text-4xl font-bold mb-6">Videos</h1>

      {isLoading && <p className="text-muted-foreground">Loading videos...</p>}
      {error && (
        <p className="text-destructive">
          Error loading videos: {error instanceof Error ? error.message : String(error)}
        </p>
      )}

      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const embedUrl = getYouTubeEmbedUrl(video.url);
            return (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle>{video.title}</CardTitle>
                  {video.description && (
                    <CardDescription>{video.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {embedUrl ? (
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Watch Video
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <p className="text-muted-foreground">
            No videos yet. Check back soon!
          </p>
        )
      )}
    </main>
  );
};

export default Videos;
