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
      className={`sticky top-0 bg-gradient-to-b from-background via-background/95 to-background/80 backdrop-blur-md border-b border-border/30 z-50 transition-all duration-300 transform-gpu shadow-sm ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent tracking-tight" data-testid="text-collapsible-header">
              AfroSphere
            </h1>
            <p className="text-xs text-muted-foreground/60 font-medium mt-0.5">Africa's Creative Home</p>
          </div>
          {isRefreshing && <Loader2 className="animate-spin text-primary" size={18} />}
        </div>

        {/* Category Tabs - Premium Style */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange?.(category.toLowerCase().replace(" ", "-"))}
              className={`whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeCategory === category.toLowerCase().replace(" ", "-")
                  ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-md hover-elevate"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60 border border-border/30"
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
