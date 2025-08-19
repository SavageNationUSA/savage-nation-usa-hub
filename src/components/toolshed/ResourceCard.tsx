import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ExternalLink, Eye, FileText, Link2, Wrench } from "lucide-react";
import { ToolshedResource } from "@/hooks/useToolshedResources";

interface ResourceCardProps {
  resource: ToolshedResource;
  onDownload?: (id: string) => void;
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'tool':
      return <Wrench className="h-5 w-5" />;
    case 'download':
      return <Download className="h-5 w-5" />;
    case 'link':
      return <Link2 className="h-5 w-5" />;
    case 'image':
      return <Eye className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

const getResourceColor = (type: string) => {
  switch (type) {
    case 'tool':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
    case 'download':
      return 'bg-green-500/10 text-green-700 dark:text-green-300';
    case 'link':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
    case 'image':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
  }
};

export const ResourceCard = ({ resource, onDownload }: ResourceCardProps) => {
  const handleAction = () => {
    if (resource.type === 'download' && resource.file_url) {
      onDownload?.(resource.id);
      window.open(resource.file_url, '_blank');
    } else if (resource.url) {
      onDownload?.(resource.id);
      window.open(resource.url, '_blank');
    }
  };

  const getActionText = () => {
    switch (resource.type) {
      case 'download':
        return 'Download';
      case 'link':
        return 'Visit';
      case 'tool':
        return 'Access';
      case 'image':
        return 'View';
      default:
        return 'Open';
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      {resource.featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-primary/90">Featured</Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getResourceColor(resource.type)}`}>
            {getResourceIcon(resource.type)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{resource.category}</Badge>
              <Badge variant="secondary" className="text-xs capitalize">{resource.type}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {resource.description && (
          <CardDescription className="text-sm mb-4 line-clamp-3">
            {resource.description}
          </CardDescription>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {resource.download_count} {resource.download_count === 1 ? 'access' : 'accesses'}
          </div>
          
          <Button 
            size="sm" 
            onClick={handleAction}
            disabled={!resource.url && !resource.file_url}
            className="min-w-[80px]"
          >
            {getResourceIcon(resource.type)}
            {getActionText()}
            {(resource.type === 'link' || (resource.type === 'download' && resource.url)) && (
              <ExternalLink className="h-3 w-3 ml-1" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};