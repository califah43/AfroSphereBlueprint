import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard, { type Post } from "./PostCard";
import { Loader2, RefreshCw } from "lucide-react";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

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
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: { username: "adikeafrica" },
    imageUrl: fashionImage,
    caption: "Celebrating our roots with modern style. Ankara fusion fashion dropping soon! 🔥 #AfricanFashion",
    likes: 1247,
    comments: 89,
    timeAgo: "2h ago",
  },
  {
    id: "2",
    author: { username: "kojoart" },
    imageUrl: artImage,
    caption: "New piece inspired by Adinkra symbols. The journey continues. #AfricanArt #ContemporaryArt",
    likes: 892,
    comments: 54,
    timeAgo: "5h ago",
  },
  {
    id: "3",
    author: { username: "amaarabeats" },
    imageUrl: musicImage,
    caption: "Late night sessions creating the future of Afrobeats. Studio vibes 🎵 #AfricanMusic #Producer",
    likes: 2103,
    comments: 156,
    timeAgo: "1d ago",
  },
];

export default function HomeFeed({ onOpenShare }: HomeFeedProps) {
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState(mockPosts);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const filteredPosts = activeCategory === "for-you"
    ? displayedPosts
    : displayedPosts.filter(post =>
        post.caption.toLowerCase().includes(activeCategory)
      );

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
      if (scrollHeight - scrollTop - clientHeight < 500 && !isLoadingMore && displayedPosts.length < 20) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setDisplayedPosts([...displayedPosts, ...mockPosts]);
          setIsLoadingMore(false);
        }, 800);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [displayedPosts, isLoadingMore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={(id) => console.log("Liked:", id)}
                      onComment={(id) => console.log("Comment:", id)}
                      onShare={(id) => onOpenShare?.()}
                      onBookmark={(id) => console.log("Bookmark:", id)}
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
    </>
  );
}
