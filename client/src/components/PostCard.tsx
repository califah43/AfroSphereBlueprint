import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Trash2, Flag, Copy, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BadgeDisplay from "./BadgeDisplay";
import EngagementBar from "./EngagementBar";
import { queryClient } from "@/lib/queryClient";
import { FontSizes } from "@/lib/fontSizes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    uniqueUsername?: string;
    avatar?: string;
  };
  imageUrl: string;
  images?: string[]; // Multiple images support
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  badges?: any[];
}

interface PostCardProps {
  post: Post;
  isOwnPost?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onOpenShare?: (postId: string) => void;
  onAuthorClick?: (username: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, isOwnPost = false, onLike, onComment, onShare, onBookmark, onOpenShare, onAuthorClick, onHashtagClick, onDelete }: PostCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likes, setLikes] = useState(post.likes);
  const [showHeart, setShowHeart] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const { toast } = useToast();
  
  // Get all images for carousel
  const allImages = post.images && post.images.length > 0 ? post.images : [post.imageUrl];
  const currentImage = allImages[currentImageIndex] || post.imageUrl;
  
  // Handle swipe for carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 50; // Minimum swipe distance
    
    if (allImages.length <= 1) return;
    
    // Swipe left - go to next image
    if (diff > threshold && currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    // Swipe right - go to previous image
    else if (diff < -threshold && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Get current user ID
  const getUserId = () => {
    let userId = localStorage.getItem("currentUserId");
    const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
    if (userData && userData.id && userData.id !== userId) {
      userId = userData.id;
    }
    return userId;
  };

  const handleLike = async () => {
    const userId = getUserId();
    
    if (!userId) {
      toast({ title: "Please sign in to like posts", variant: "destructive" });
      return;
    }

    // Optimistic update - update UI immediately
    const previousLiked = isLiked;
    const previousLikes = likes;
    const newLiked = !isLiked;
    const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);
    
    setIsLiked(newLiked);
    setLikes(newLikes);

    try {
      const res = await fetch('/api/likes/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, postId: post.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.likes !== undefined) {
          setLikes(data.likes);
        }
        setIsLiked(data.liked);
      } else {
        // Rollback on error
        setIsLiked(previousLiked);
        setLikes(previousLikes);
        toast({ title: "Error", description: "Failed to like post", variant: "destructive" });
      }
      onLike?.(post.id);
    } catch (error) {
      // Rollback on error
      setIsLiked(previousLiked);
      setLikes(previousLikes);
      toast({ title: "Error", description: "Failed to like post", variant: "destructive" });
    }
  };

  const handleDoubleClick = () => {
    // Call the actual like API function for double-tap too
    if (!isLiked) {
      handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);

    toast({
      title: isBookmarked ? "Removed from saved" : "Post saved!",
      description: isBookmarked ? "Removed from your collection" : "Added to your saved collection",
    });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Invalidate all posts queries to refresh the feed
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });

      // Close dialog and show success toast
      setShowDeleteDialog(false);
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
        variant: "destructive",
      });

      // Call callback if provided
      onDelete?.(post.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Safe author fallback values
  const authorUsername = post.author?.username || "Anonymous";
  const authorHandle = post.author?.uniqueUsername || post.author?.username || "unknown";
  const authorId = post.author?.id || "";
  const authorAvatar = post.author?.avatar;

  return (
    <div className="bg-background overflow-hidden mb-0 border-b border-border/20" data-testid={`card-post-${post.id}`}>
      {/* Header - Avatar LEFT, Info & Menu RIGHT - Twitter X Style (Compact) */}
      <div className="flex items-start gap-3 px-3 py-2.5">
        <button 
          onClick={() => onAuthorClick?.(post.author?.uniqueUsername || post.author?.username)}
          className="flex-shrink-0 hover-elevate transition-all"
          data-testid={`button-author-profile-${post.id}`}
        >
          <Avatar className="w-11 h-11 select-none pointer-events-auto ring-1 ring-border/20">
            <AvatarImage src={authorAvatar} className="select-none user-select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} data-testid={`img-avatar-${post.id}`} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-orange-500/30 font-semibold select-none">{authorUsername[0]?.toUpperCase() || "A"}</AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <p className="font-bold text-foreground" style={{ fontSize: FontSizes.bodyS }} data-testid={`text-username-${post.id}`}>
                {authorUsername}
              </p>
              {post.badges && post.badges.length > 0 ? (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {post.badges.map((badge) => (
                    <div key={badge.id} className="w-4 h-4 inline-block flex-shrink-0 select-none" title={badge.name}>
                      <img 
                        src={`data:image/svg+xml;base64,${btoa(badge.iconSvg)}`} 
                        alt={badge.name}
                        className="w-full h-full select-none user-select-none"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        data-testid={`img-badge-${badge.id}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                authorId && <BadgeDisplay userId={authorId} className="inline-flex flex-shrink-0" />
              )}
              <p className="text-muted-foreground/70" style={{ fontSize: FontSizes.captionS }} data-testid={`text-handle-${post.id}`}>
                @{authorHandle}
              </p>
              <span className="text-muted-foreground/60" style={{ fontSize: FontSizes.captionS }}>·</span>
              <p className="text-muted-foreground/60 flex-shrink-0 whitespace-nowrap" style={{ fontSize: FontSizes.captionS }} data-testid={`text-time-${post.id}`}>
                {post.timeAgo}
              </p>
            </div>

            {/* Caption Text - Right Below Header */}
            <p className="leading-relaxed mt-1.5 text-foreground" style={{ fontSize: FontSizes.bodyS }} data-testid={`text-caption-${post.id}`}>
            {post.caption?.split(/(\#\w+)/g).map((part, i) => 
              part.startsWith('#') ? (
                <button
                  key={i}
                  onClick={() => onHashtagClick?.(part.substring(1))}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  data-testid={`button-hashtag-${part.substring(1)}`}
                >
                  {part}
                </button>
              ) : (
                part
              )
            )}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover-elevate active-elevate-2 flex-shrink-0 h-8 w-8"
                data-testid={`button-menu-${post.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg border border-border/50 p-2">
              {/* Own Post Actions - Premium Section */}
              {isOwnPost && (
                <>
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Post Actions</p>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)} 
                      className="bg-destructive/5 hover:bg-destructive/10 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg mb-1"
                      data-testid={`button-delete-own-${post.id}`}
                    >
                      <Trash2 className="mr-3 h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">Delete post</p>
                        <p className="text-xs text-destructive/70">Remove permanently</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                </>
              )}

              {/* Other User's Post Actions - Premium Section */}
              {!isOwnPost && (
                <>
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Feedback</p>
                    <DropdownMenuItem 
                      onClick={() => {}}
                      className="hover:bg-muted/50 cursor-pointer rounded-lg mb-1"
                      data-testid={`button-not-interested-${post.id}`}
                    >
                      <Eye className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Not interested</p>
                        <p className="text-xs text-muted-foreground">See less from this creator</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)} 
                      className="bg-destructive/5 hover:bg-destructive/10 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg"
                      data-testid={`button-report-${post.id}`}
                    >
                      <Flag className="mr-3 h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold">Report post</p>
                        <p className="text-xs text-destructive/70">Let us know</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                </>
              )}

              {/* Common Actions - Premium Section */}
              <div className="px-2 py-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Actions</p>
                <DropdownMenuItem 
                  onClick={() => {
                    const postUrl = `${window.location.origin}/post/${post.id}`;
                    navigator.clipboard.writeText(postUrl);
                    toast({
                      title: "Link copied!",
                      description: "Post link copied to clipboard",
                    });
                  }}
                  className="hover:bg-muted/50 cursor-pointer rounded-lg mb-1"
                  data-testid={`button-copy-link-${post.id}`}
                >
                  <Copy className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="font-medium text-sm">Copy link</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleBookmark}
                  className="hover:bg-muted/50 cursor-pointer rounded-lg mb-1"
                  data-testid={`button-bookmark-menu-${post.id}`}
                >
                  <Bookmark className={`mr-3 h-4 w-4 flex-shrink-0 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  <span className={`font-medium text-sm ${isBookmarked ? "text-primary" : ""}`}>{isBookmarked ? "Unsave" : "Save for later"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-muted/50 cursor-pointer rounded-lg"
                  data-testid={`button-share-menu-${post.id}`}
                >
                  <Share2 className="mr-3 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="font-medium text-sm">Share</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">
                {isOwnPost ? "Delete this post?" : "Report this post?"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                {isOwnPost 
                  ? "This action cannot be undone." 
                  : "Help us understand the problem. We'll review and take action if needed."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className={isOwnPost ? "bg-destructive text-destructive-foreground" : "bg-primary"}
              >
                {isOwnPost ? "Delete" : "Report"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Image Section - Rounded Corners (Twitter/X Style) */}
      <div 
        className="relative mx-3 mb-0 rounded-xl overflow-hidden bg-gradient-to-br from-muted/40 to-muted/20" 
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage}
          alt="Post content"
          className="w-full aspect-feed object-cover cursor-pointer select-none"
          data-testid={`img-post-${post.id}`}
          draggable={false}
        />
        
        {/* Image carousel indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1 px-2.5 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
            {allImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-2.5 bg-white' : 'bg-white/50'}`}
                data-testid={`indicator-image-${idx}`}
              />
            ))}
          </div>
        )}
        
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart 
              className="w-28 h-28 text-primary fill-primary drop-shadow-lg" 
              style={{ animation: 'instagramHeartBurst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }} 
            />
          </div>
        )}
      </div>

      {/* Premium Engagement Bar */}
      <EngagementBar
        postId={post.id}
        likes={likes}
        comments={post.comments}
        views={0}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        onLike={handleLike}
        onComment={() => onComment?.(post.id)}
        onBookmark={handleBookmark}
        onShare={() => onShare?.(post.id)}
        data-testid={`bar-engagement-${post.id}`}
      />
    </div>
  );
}
