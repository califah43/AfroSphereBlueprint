import { useState, useRef, useEffect } from "react";
import PostCard, { type Post } from "./PostCard";
import { Loader2, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { mockPosts } from "@/data/mockData";
import CollapsibleHeader from "./CollapsibleHeader";
import CreatorRecommendations from "./CreatorRecommendations";
import { useLanguage } from "@/context/LanguageContext";

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
  onCommentClick?: (postId: string, imageUrl: string | string[], caption: string) => void;
  onCreateClick?: () => void;
}

export default function HomeFeed({ onOpenShare, onUserProfileClick, onHashtagClick, onCommentClick, onCreateClick }: HomeFeedProps) {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>(mockPosts);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  // Get current user ID on mount - compare by ID instead of username
  useEffect(() => {
    let userId = localStorage.getItem("currentUserId");
    const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
    if (userData && userData.id) {
      userId = userData.id;
    }
    setCurrentUserId(userId);
  }, []);

  // Listen for post refresh events and real-time updates
  useEffect(() => {
    const handleCommentCreated = (event: CustomEvent) => {
      // Invalidate the posts query cache to trigger a refresh when needed
      // This lets the user decide if they want to see new comments via scroll
    };

    const handlePostLiked = (event: CustomEvent) => {
      const { postId, liked, likes } = event.detail;
      setDisplayedPosts(prev => 
        prev.map(p => p.id === postId ? { ...p, likes: likes || 0 } : p)
      );
    };
    
    window.addEventListener('comment:created' as any, handleCommentCreated as EventListener);
    window.addEventListener('post:liked' as any, handlePostLiked as EventListener);
    
    return () => {
      window.removeEventListener('comment:created' as any, handleCommentCreated as EventListener);
      window.removeEventListener('post:liked' as any, handlePostLiked as EventListener);
    };
  }, []);

  // Fetch posts from API with like status
  const { data: apiPosts = [], isLoading: isInitialLoading } = useQuery({
    queryKey: ['/api/posts'],
    staleTime: 10 * 60 * 1000, // Data stays fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep cache for 30 minutes
    refetchInterval: false, // Don't auto-refetch - let user manually refresh
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
        const viewerIdParam = userId ? `&viewerId=${userId}` : '';
        const [postsRes, usersRes, badgesRes] = await Promise.all([
          fetch(`/api/posts?limit=50${viewerIdParam}`),
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
        }).filter((post: any) => post.author.username !== "creator"); // Remove placeholder posts
        
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
      setIsHeaderVisible(true); // Keep header visible during refresh
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

  // Facebook-style header hide/show on scroll + infinite scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      const { scrollHeight, clientHeight } = container;
      const scrollDelta = currentScrollY - lastScrollTop;
      
      // Facebook-style header hide/show logic with threshold to prevent jitter
      if (!isRefreshing && pullDistance === 0) {
        // Keep header visible near top (refresh zone) or during pull attempts
        if (currentScrollY < 50) {
          setIsHeaderVisible(true);
        } else {
          // Only toggle on significant scroll (15px threshold)
          // scroll down significantly → hide header
          if (scrollDelta > 15) {
            setIsHeaderVisible(false);
          }
          // scroll up significantly → show header
          else if (scrollDelta < -15) {
            setIsHeaderVisible(true);
          }
          // small scrolls don't change header state
        }
      } else {
        // Always show header during refresh or pull attempts
        setIsHeaderVisible(true);
      }

      setLastScrollTop(currentScrollY);
      
      // Load more when near bottom
      if (scrollHeight - currentScrollY - clientHeight < 500 && displayedPosts.length < 50) {
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
          {/* Creator Recommendations - Show on for-you tab */}
          {activeCategory === "for-you" && currentUserId && (
            <CreatorRecommendations 
              userId={currentUserId} 
              onCreatorClick={onUserProfileClick}
              limit={6}
            />
          )}

          {filteredPosts.length > 0 ? (
            <>
              {filteredPosts.map((post) => (
                <div key={post.id} className="animate-in fade-in duration-500">
                  <PostCard
                    post={post}
                    isOwnPost={post.author.id === currentUserId}
                    onLike={(id) => console.log("Liked:", id)}
                    onComment={(id) => onCommentClick?.(id, post.images && post.images.length > 0 ? post.images : post.imageUrl, post.caption)}
                    onShare={(id) => onOpenShare?.()}
                    onBookmark={(id) => {
                      // Bookmark callback - the actual save happens in PostCard now
                      queryClient.invalidateQueries({ queryKey: ['/api/posts/user', currentUserId, 'saved'] });
                    }}
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

      {/* Floating Create Button */}
      <Button
        onClick={onCreateClick}
        size="icon"
        className="fixed right-4 bottom-24 h-14 w-14 rounded-full gold-glow shadow-lg transition-all hover:scale-110"
        data-testid="button-create-post-floating"
      >
        <Plus className="h-7 w-7" />
      </Button>
    </div>
  );
}
