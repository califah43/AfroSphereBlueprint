import { useState, useEffect } from "react";
import { Flame, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TrendingPost {
  id: string;
  image: string;
  likes: number;
  commentCount: number;
  caption: string;
  userId: string;
}

interface TrendingPostsProps {
  onPostClick?: (postId: string) => void;
}

export default function TrendingPosts({ onPostClick }: TrendingPostsProps) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const res = await fetch("/api/trending/posts");
        const data = await res.json();
        setPosts(data.slice(0, 30));
      } catch (error) {
        console.error("Failed to fetch trending posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  return (
    <div className="pb-20" data-testid="container-trending-posts">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-trending-title">
            <Flame className="h-6 w-6 text-orange-500" />
            Trending Now
          </h1>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Posts Grid */}
      {!isLoading && posts.length > 0 && (
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => onPostClick?.(post.id)}
                className="aspect-square hover-elevate overflow-hidden rounded-lg ring-1 ring-border/50 group transition-all duration-300 relative"
                data-testid={`trending-post-${post.id}`}
              >
                <img
                  src={post.image}
                  alt="Trending post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay with engagement metrics */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                  <div className="flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {post.likes > 999 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
                    </span>
                    <span className="text-xs">
                      {(post.likes + post.commentCount * 2).toLocaleString()} engagement
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && posts.length === 0 && (
        <div className="flex justify-center py-12 text-muted-foreground">
          <p className="text-sm">No trending posts at the moment</p>
        </div>
      )}
    </div>
  );
}
