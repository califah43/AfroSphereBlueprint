import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import PostCard from "./PostCard";

interface CategoryFeedProps {
  category: string;
  onClose: () => void;
  onPostClick?: (postId: string) => void;
}

export default function CategoryFeed({ category, onClose, onPostClick }: CategoryFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  
  const { data, isLoading } = useQuery({
    queryKey: [`/api/posts/category/${category}`],
    queryFn: async () => {
      const res = await fetch(`/api/posts/category/${category}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      setPosts(data);
    }
  }, [data]);

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-category">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{categoryTitle}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No posts in this category yet</div>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => onPostClick?.(post.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
