import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard, { type Post } from "./PostCard";
import { Loader2, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

const PostSkeleton = () => (
  <div className="mb-4 animate-pulse space-y-3 bg-muted/50 rounded-lg p-4 border border-border">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-10 h-10 bg-muted rounded-full"></div>
      <div className="flex-1">
        <div className="h-3 bg-muted rounded w-24 mb-1"></div>
        <div className="h-2 bg-muted rounded w-16"></div>
      </div>
    </div>
    <div className="h-40 bg-muted rounded-lg mb-2"></div>
    <div className="h-3 bg-muted rounded w-full mb-1"></div>
    <div className="h-3 bg-muted rounded w-5/6"></div>
    <div className="flex gap-2 mt-2">
      <div className="h-6 bg-muted rounded w-12"></div>
      <div className="h-6 bg-muted rounded w-12"></div>
      <div className="h-6 bg-muted rounded w-12"></div>
    </div>
  </div>
);

interface HomeFeedProps {
  onOpenShare?: () => void;
  onUserProfileClick?: (username: string) => void;
}

export default function HomeFeed({ onOpenShare, onUserProfileClick }: HomeFeedProps) {
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // Fetch posts from API
  const { data: apiPosts = [], isLoading: isInitialLoading } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/posts?limit=50');
        return res.json();
      } catch {
        return [];
      }
    },
  });

  // Update displayed posts from API with user data enrichment
  useEffect(() => {
    const enrichPosts = async () => {
      try {
        const enriched = await Promise.all(
          (apiPosts || []).map(async (post: any) => {
            try {
              const userRes = await fetch(`/api/users/${post.userId}`);
              const user = await userRes.json();
              
              return {
                ...post,
                id: post.id || post.userId,
                author: {
                  username: user.username || post.userId,
                  avatar: user.avatar || null
                },
                imageUrl: post.image,
                likes: post.likes || 0,
                comments: post.comments || 0,
                timeAgo: post.timeAgo || "now"
              };
            } catch {
              // Fallback if user fetch fails
              return {
                ...post,
                id: post.id || post.userId,
                author: {
                  username: post.userId,
                  avatar: null
                },
                imageUrl: post.image,
                likes: post.likes || 0,
                comments: post.comments || 0,
                timeAgo: post.timeAgo || "now"
              };
            }
          })
        );
        setDisplayedPosts(enriched);
      } catch {
        setDisplayedPosts(apiPosts as Post[]);
      }
    };
    
    enrichPosts();
  }, [apiPosts]);

  const filteredPosts = activeCategory === "for-you"
    ? displayedPosts
    : displayedPosts.filter(post => {
        const postCategory = (post as any).category?.toLowerCase() || "";
        return postCategory === activeCategory.toLowerCase();
      });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      setHasNewPosts(false);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1200);
    } else {
      setPullDistance(0);
    }
  };

  // Infinite scroll detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Load more when near bottom
      if (scrollHeight - scrollTop - clientHeight < 500 && displayedPosts.length < 50) {
        const offset = displayedPosts.length;
        fetch(`/api/posts?limit=20&offset=${offset}`)
          .then(res => res.json())
          .then(newPosts => {
            if (newPosts && newPosts.length > 0) {
              setDisplayedPosts([...displayedPosts, ...newPosts]);
            }
          })
          .catch(() => {});
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [displayedPosts]);

  return (
    <>
      <div
        className="pb-20"
        data-testid="container-home-feed"
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ overflowY: "auto", height: "100vh" }}
      >
        {/* Pull-to-Refresh Indicator */}
        {pullDistance > 0 && !isRefreshing && (
          <div 
            className="flex justify-center items-center transition-all"
            style={{ 
              height: `${pullDistance}px`,
              opacity: Math.min(pullDistance / 80, 1)
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <RefreshCw 
                className="text-primary transition-transform" 
                size={18} 
                style={{ 
                  transform: `rotate(${(pullDistance / 80) * 180}deg)`,
                  opacity: pullDistance / 80 
                }} 
              />
              <span className="text-xs text-muted-foreground font-medium">
                {pullDistance > 80 ? "Release to refresh" : "Pull to refresh"}
              </span>
            </div>
          </div>
        )}

        {/* Refresh Progress Bar */}
        {isRefreshing && (
          <div className="h-1 bg-primary/20 relative overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-primary to-primary/50 animate-pulse" />
          </div>
        )}

        {/* New Posts Indicator */}
        {hasNewPosts && !isRefreshing && (
          <div className="flex justify-center py-2 sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
            <button 
              onClick={() => {
                scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                setHasNewPosts(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full text-xs font-semibold text-primary transition-all hover-elevate"
              data-testid="button-new-posts"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              View new posts
            </button>
          </div>
        )}

        {/* Header with Tabs */}
        <div className="sticky top-0 bg-background z-10 border-b border-border">
          <div className="max-w-md mx-auto px-4 py-3">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2" data-testid="text-feed-title">
              AfroSphere
              {isRefreshing && <Loader2 className="animate-spin text-primary" size={18} />}
            </h1>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="w-full grid grid-cols-6 h-auto">
                <TabsTrigger value="for-you" className="text-xs" data-testid="tab-for-you">
                  For You
                </TabsTrigger>
                <TabsTrigger value="fashion" className="text-xs" data-testid="tab-fashion">
                  Fashion
                </TabsTrigger>
                <TabsTrigger value="music" className="text-xs" data-testid="tab-music">
                  Music
                </TabsTrigger>
                <TabsTrigger value="art" className="text-xs" data-testid="tab-art">
                  Art
                </TabsTrigger>
                <TabsTrigger value="culture" className="text-xs" data-testid="tab-culture">
                  Culture
                </TabsTrigger>
                <TabsTrigger value="lifestyle" className="text-xs" data-testid="tab-lifestyle">
                  Lifestyle
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Feed Content */}
        <div className="max-w-md mx-auto px-4 pt-4">
          {isInitialLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : (
            <>
              {filteredPosts.length > 0 ? (
                <>
                  {filteredPosts.map((post) => {
                    const currentUserId = localStorage.getItem("currentUserId");
                    const postUserId = (post as any).userId;
                    const isOwnPost = currentUserId === postUserId;
                    
                    return (
                      <PostCard
                        key={post.id}
                        post={post}
                        isOwnPost={isOwnPost}
                        onLike={(id) => console.log("Liked:", id)}
                        onComment={(id) => console.log("Comment:", id)}
                        onShare={(id) => onOpenShare?.()}
                        onBookmark={(id) => console.log("Bookmark:", id)}
                        onAuthorClick={(username) => onUserProfileClick?.(username)}
                      />
                    );
                  })}
                  
                  {/* Loading More Indicator */}
                  {isLoadingMore && (
                    <>
                      <PostSkeleton />
                      <PostSkeleton />
                    </>
                  )}
                </>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground font-medium">No posts yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to share something amazing!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
