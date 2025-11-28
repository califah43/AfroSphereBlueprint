import { Loader2 } from "lucide-react";

interface CollapsibleHeaderProps {
  isRefreshing?: boolean;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  isVisible?: boolean;
}

export default function CollapsibleHeader({ isRefreshing, activeCategory, onCategoryChange, isVisible = true }: CollapsibleHeaderProps) {
  const categories = ["For You", "Fashion", "Music", "Art", "Culture", "Lifestyle"];

  return (
    <div
      className={`sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 transition-all duration-300 transform-gpu ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black tracking-tight" data-testid="text-collapsible-header">
            AfroSphere
          </h1>
          {isRefreshing && <Loader2 className="animate-spin text-primary" size={16} />}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange?.(category.toLowerCase().replace(" ", "-"))}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeCategory === category.toLowerCase()
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
              data-testid={`tab-${category.toLowerCase().replace(" ", "-")}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
