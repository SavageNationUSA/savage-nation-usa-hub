import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { useToolshedResources } from "@/hooks/useToolshedResources";
import { ResourceFilters } from "@/components/toolshed/ResourceFilters";
import { ResourceGrid } from "@/components/toolshed/ResourceGrid";

const Toolshed = () => {
  const { resources, loading, incrementDownloadCount } = useToolshedResources();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract unique categories and tags
  const { categories, availableTags } = useMemo(() => {
    const categorySet = new Set<string>();
    const tagSet = new Set<string>();
    
    resources.forEach(resource => {
      categorySet.add(resource.category);
      if (resource.tags) {
        resource.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return {
      categories: Array.from(categorySet).sort(),
      availableTags: Array.from(tagSet).sort()
    };
  }, [resources]);

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    let filtered = resources.filter(resource => {
      // Search filter
      const matchesSearch = !searchQuery || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

      // Type filter
      const matchesType = selectedType === 'all' || resource.type === selectedType;

      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => resource.tags?.includes(tag));

      return matchesSearch && matchesCategory && matchesType && matchesTags;
    });

    // Sort resources
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.download_count - a.download_count;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'featured':
        default:
          if (a.featured !== b.featured) {
            return b.featured ? 1 : -1;
          }
          return b.download_count - a.download_count;
      }
    });

    return filtered;
  }, [resources, searchQuery, selectedCategory, selectedType, selectedTags, sortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedTags([]);
  };

  return (
    <>
      <SEO 
        title="Toolshed - Savage Nation USA"
        description="Access our comprehensive collection of tools, downloads, and resources. Everything you need from Savage Nation USA in one searchable hub."
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Toolshed</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive resource hub for tools, downloads, links, and everything you need from Savage Nation USA.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <ResourceFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              availableTags={availableTags}
              categories={categories}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Results Stats */}
          {!loading && (
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {filteredResources.length} of {resources.length} resources
            </div>
          )}

          {/* Resource Grid */}
          <ResourceGrid
            resources={filteredResources}
            loading={loading}
            viewMode={viewMode}
            onDownload={incrementDownloadCount}
          />
        </div>
      </div>
    </>
  );
};

export default Toolshed;
