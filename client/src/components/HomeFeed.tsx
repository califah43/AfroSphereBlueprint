import { useState, useRef, useEffect } from "react";
import PostCard, { type Post } from "./PostCard";
import { Loader2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { mockPosts } from "@/data/mockData";
import CollapsibleHeader from "./CollapsibleHeader";
import { useTranslation } from "@/hooks/useTranslation";

const PostSkeleton = () => (
  <div className="mb-6 animate-pulse space-y-3 bg-gradient-to-b from-muted/20 to-muted/10 rounded-2xl p-5 border border-border/20 opacity-50">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-muted/40 rounded-full"></div>
      <div className="flex-1">
        <div className="h-3.5 bg-muted/40 rounded w-28 mb-2"></div>
        <div className="h-2.5 bg-muted/30 rounded w-20"></div>
      </div>
    </div>
    <div className="h-48 bg-muted/30 rounded-xl mb-2"></div>
    <div className="h-3 bg-muted/30 rounded w-32 mb-3"></div>
    <div className="h-3.5 bg-muted/30 rounded w-full mb-2"></div>
    <div className="h-3 bg-muted/30 rounded w-5/6"></div>
    <div className="flex gap-3 mt-4">
      <div className="h-6 bg-muted/30 rounded w-10"></div>
      <div className="h-6 bg-muted/30 rounded w-10"></div>
      <div className="h-6 bg-muted/30 rounded w-10"></div>
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
  const { t } = useTranslation();
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

  // Helper to format time - MUST be defined before query
  const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return "now";
    const date = new Date(dateString);
    const now = Date.now();
    const diff = now - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (seconds < 60) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "1d ago";
    return `${days}d ago`;
  };

  // Listen for post refresh events (triggered when comments are added)
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('refreshPosts', handleRefresh);
    return () => window.removeEventListener('refreshPosts', handleRefresh);
  }, []);

  // Fetch posts from API with like status
  const { data: apiPosts = [], isLoading: isInitialLoading } = useQuery({
    queryKey: ['/api/posts', refreshKey],
    staleTime: 30000, // Data stays fresh for 30s, then silently refetch in background
    gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes
    refetchInterval: 45000, // Auto-refetch every 45s for seamless updates
    placeholderData: keepPreviousData, // Keep showing old data while refetching - no skeleton flash!
    queryFn: async () => {
      try {
        // Get current user ID
        let userId = localStorage.getItem("currentUserId");
        const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
        if (userData && userData.id && userData.id !== userId) {
          userId = userData.id;
        }

        // Fetch posts, all users, and all badges in parallel
        const [postsRes, usersRes, badgesRes] = await Promise.all([
          fetch('/api/posts?limit=50'),
          fetch('/api/users/all'),
          fetch('/api/badges/all'),
        ]);
        
        const posts = await postsRes.json();
        const allUsers = usersRes.ok ? await usersRes.json() : [];
        const allBadges = badgesRes.ok ? await badgesRes.json() : [];
        
        // Create a map for fast user lookup
        const userMap = new Map();
        allUsers.forEach((u: any) => {
          userMap.set(u.id, u);
        });

        // Create a map for fast badge lookup by userId (allBadges is already assignment objects)
        const badgeMap = new Map();
        if (Array.isArray(allBadges)) {
          allBadges.forEach((badgeAssignment: any) => {
            if (!badgeMap.has(badgeAssignment.userId)) {
              badgeMap.set(badgeAssignment.userId, []);
            }
            badgeMap.get(badgeAssignment.userId).push({
              id: badgeAssignment.badgeId || badgeAssignment.id,
              name: badgeAssignment.name,
              iconSvg: badgeAssignment.iconSvg,
              type: badgeAssignment.type,
            });
          });
        }

        // Batch check likes for real posts
        let likedPostIds: string[] = [];
        if (userId && posts.length > 0) {
          try {
            const likeRes = await fetch('/api/likes/posts/batch-check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, postIds: posts.map((p: any) => p.id) }),
            });
            if (likeRes.ok) {
              const likeData = await likeRes.json();
              likedPostIds = likeData.likedPostIds || [];
            }
          } catch (e) {
            console.error('Failed to fetch likes:', e);
          }
        }
        
        // Transform real posts using pre-fetched user data, likes, and badges
        const transformedRealPosts = (posts || []).map((p: any) => {
          const user = userMap.get(p.userId);
          return {
            id: p.id,
            author: { 
              id: p.userId,
              username: user?.displayName || "creator",
              uniqueUsername: user?.username || "creator",
              avatar: user?.avatar || "" 
            },
            imageUrl: p.image,
            images: p.images && p.images.length > 0 ? p.images : [p.image],
            caption: p.caption,
            likes: p.likes !== undefined ? p.likes : 0,
            comments: p.commentCount !== undefined ? p.commentCount : 0,
            timeAgo: formatTimeAgo(p.createdAt),
            category: p.category || "for-you",
            isLiked: likedPostIds.includes(p.id),
            badges: badgeMap.get(p.userId) || [],
          };
        });
        
        // Combine: real posts (newest first) at top, then mock posts below for demo
        return [...transformedRealPosts, ...mockPosts];
      } catch {
        return mockPosts;
      }
    },
  });

  // Update displayed posts from API, always use provided data (real posts + mock posts below)
  useEffect(() => {
    if (apiPosts && apiPosts.length > 0) {
      setDisplayedPosts(apiPosts as Post[]);
    } else if (!apiPosts || apiPosts.length === 0) {
      // Ensure mock posts are shown when API is empty
      setDisplayedPosts(mockPosts);
    }
  }, [apiPosts]);

  const filteredPosts = activeCategory === "for-you"
    ? displayedPosts
    : displayedPosts.filter(post => {
        const postCategory = (post as any).category?.toLowerCase() || "";
        return postCategory === activeCategory.toLowerCase();
      });

  // Prevent comments/interactions on mock posts by adding testid data
  const getPostId = (post: any) => post.id;

  // Pass activeCategory to CollapsibleHeader for tab styling
  const categoriesWithForYou = [
    { id: "for-you", label: "For You" },
    { id: "fashion", label: "Fashion" },
    { id: "music", label: "Music" },
    { id: "art", label: "Art" },
    { id: "culture", label: "Culture" },
  ];

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
      // Force refetch in background - no artificial delay
      queryClient.refetchQueries({ queryKey: ['/api/posts'] });
      // End refresh animation after smooth completion
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 800);
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
      
      // Keep header visible during refresh
      if (!isRefreshing) {
        // Handle header visibility only when not refreshing
        const scrollDelta = scrollTop - lastScrollTop;
        if (scrollDelta < -10) {
          setIsHeaderVisible(true);
        } else if (scrollDelta > 10) {
          setIsHeaderVisible(false);
        }
      } else {
        // Always show header during refresh
        setIsHeaderVisible(true);
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
  }, [displayedPosts, lastScrollTop, isRefreshing]);

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

      {/* Pull-to-Refresh Indicator - Subtle and smooth */}
      {pullDistance > 0 && (
        <div 
          className="flex justify-center items-center"
          style={{ 
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / 80, 0.4),
            transform: `scale(${Math.min(pullDistance / 80, 1)})`,
            transition: isRefreshing ? 'none' : 'all 150ms ease-out'
          }}
        >
          <RefreshCw 
            className="text-primary/40" 
            size={16} 
            style={{ 
              transform: `rotate(${(pullDistance / 80) * 180}deg)`,
              opacity: pullDistance / 80 * 0.6,
              transition: 'transform 0.1s linear'
            }} 
          />
        </div>
      )}

      {/* Refresh Progress Bar - Very Subtle */}
      {isRefreshing && (
        <div className="h-0.5 bg-primary/10 relative overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" style={{ animation: 'shimmer 2s infinite' }} />
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
            {t("feed.newPosts")}
          </button>
        </div>
      )}

      {/* Feed Content */}
      <div className="max-w-md mx-auto px-0 pt-0">
          {filteredPosts.length > 0 ? (
            <>
              {filteredPosts.map((post) => (
                <div key={post.id} className="animate-in fade-in duration-500">
                  <PostCard
                    post={post}
                    isOwnPost={post.author.username === "adikeafrica"}
                    onLike={(id) => console.log("Liked:", id)}
                    onComment={(id) => onCommentClick?.(id, post.imageUrl, post.caption)}
                    onShare={(id) => onOpenShare?.()}
                    onBookmark={(id) => console.log("Bookmark:", id)}
                    onAuthorClick={(username) => onUserProfileClick?.(username)}
                    onHashtagClick={(tag) => onHashtagClick?.(tag)}
                  />
                </div>
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
              <p className="text-muted-foreground font-medium">{t("feed.noPost")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("feed.beFirst")}</p>
            </div>
          )}
      </div>
    </div>
  );
}
