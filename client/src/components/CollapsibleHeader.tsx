import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface CollapsibleHeaderProps {
  isRefreshing?: boolean;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function CollapsibleHeader({ isRefreshing, activeCategory, onCategoryChange }: CollapsibleHeaderProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScroll = container.scrollTop;
      const scrollDelta = currentScroll - lastScrollTop;

      // Show header when scrolling up, hide when scrolling down
      if (scrollDelta < -10) {
        // Scrolling up
        setIsHeaderVisible(true);
      } else if (scrollDelta > 10) {
        // Scrolling down
        setIsHeaderVisible(false);
      }

      setLastScrollTop(currentScroll);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  const categories = ["For You", "Fashion", "Music", "Art", "Culture", "Lifestyle"];

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto h-screen pb-20"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Sticky Collapsible Header */}
      <div
        className={`sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 transition-all duration-300 transform-gpu ${
          isHeaderVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
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

      {/* Content will be passed as children */}
    </div>
  );
}
