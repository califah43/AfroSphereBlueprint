import { useState, useRef, useEffect } from "react";
import PostCard, { type Post } from "./PostCard";
import { Loader2, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { mockPosts } from "@/data/mockData";
import CollapsibleHeader from "./CollapsibleHeader";

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
  onHashtagClick?: (hashtag: string) => void;
  onCommentClick?: (postId: string, imageUrl: string, caption: string) => void;
}

export default function HomeFeed({ onOpenShare, onUserProfileClick, onHashtagClick, onCommentClick }: HomeFeedProps) {
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>(mockPosts);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // Listen for post refresh events (triggered when comments are added)
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('refreshPosts', handleRefresh);
    return () => window.removeEventListener('refreshPosts', handleRefresh);
  }, []);

  // Fetch posts from API
  const { data: apiPosts = [], isLoading: isInitialLoading } = useQuery({
    queryKey: ['/api/posts', refreshKey],
    queryFn: async () => {
      try {
        const res = await fetch('/api/posts?limit=50');
        const posts = await res.json();
        
        // Transform backend posts to match frontend structure
        return Promise.all(posts.map(async (p: any) => {
          try {
            const userRes = await fetch(`/api/users/${p.userId}`);
            const user = await userRes.json();
            return {
              id: p.id,
              author: { username: user.username || "creator", avatar: user.avatar },
              imageUrl: p.image,
              caption: p.caption,
              likes: p.likes || 0,
              comments: p.commentCount || 0,
              timeAgo: p.createdAt ? formatTimeAgo(new Date(p.createdAt)) : "now",
              category: p.category,
            };
          } catch (e) {
            return null;
          }
        })).then(posts => posts.filter(Boolean));
      } catch {
        return mockPosts;
      }
    },
  });

  // Helper to format time
  const formatTimeAgo = (date: Date) => {
    const now = Date.now();
    const diff = now - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours === 0) return "now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "1d ago";
    return `${days}d ago`;
  };

  // Fallback to mock data if API returns empty
  useEffect(() => {
    if (apiPosts && apiPosts.length > 0) {
      setDisplayedPosts(apiPosts as Post[]);
    }
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

  // Infinite scroll detection + header visibility
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Handle header visibility
      const scrollDelta = scrollTop - lastScrollTop;
      if (scrollDelta < -10) {
        setIsHeaderVisible(true);
      } else if (scrollDelta > 10) {
        setIsHeaderVisible(false);
      }
      setLastScrollTop(scrollTop);
      
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

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [displayedPosts, lastScrollTop]);

  return (
    <div
      className="pb-20"
      data-testid="container-home-feed"
      ref={scrollContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overflowY: "auto", height: "100vh" }}
    >
      {/* Collapsible Header */}
      <CollapsibleHeader 
        isRefreshing={isRefreshing}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isVisible={isHeaderVisible}
      />

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
        <div className="flex justify-center py-2 sticky top-12 z-40 bg-background/95 backdrop-blur-sm">
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
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      isOwnPost={post.author.username === "adikeafrica"}
                      onLike={(id) => console.log("Liked:", id)}
                      onComment={(id) => onCommentClick?.(id, post.imageUrl, post.caption)}
                      onShare={(id) => onOpenShare?.()}
                      onBookmark={(id) => console.log("Bookmark:", id)}
                      onAuthorClick={(username) => onUserProfileClick?.(username)}
                      onHashtagClick={(tag) => onHashtagClick?.(tag)}
                    />
                  ))}
                  
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
  );
}
