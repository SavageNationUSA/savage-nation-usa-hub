import { ResourceCard } from "./ResourceCard";
import { ToolshedResource } from "@/hooks/useToolshedResources";
import { Skeleton } from "@/components/ui/skeleton";

interface ResourceGridProps {
  resources: ToolshedResource[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onDownload: (id: string) => void;
}

export const ResourceGrid = ({ resources, loading, viewMode, onDownload }: ResourceGridProps) => {
  if (loading) {
    return (
      <div className={`gap-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">No resources found</div>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search criteria or filters
        </p>
      </div>
    );
  }

  return (
    <div className={`gap-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'}`}>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};