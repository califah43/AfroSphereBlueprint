import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Trash2, Flag, Copy, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import BadgeDisplay from "./BadgeDisplay";
import { queryClient } from "@/lib/queryClient";
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
      {/* Header - Avatar LEFT, Info & Menu RIGHT - Twitter X Style */}
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <button 
          onClick={() => onAuthorClick?.(post.author?.uniqueUsername || post.author?.username)}
          className="flex-shrink-0 hover-elevate transition-all"
          data-testid={`button-author-profile-${post.id}`}
        >
          <Avatar className="w-12 h-12 select-none pointer-events-auto ring-1 ring-border/20">
            <AvatarImage src={authorAvatar} className="select-none user-select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} data-testid={`img-avatar-${post.id}`} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-orange-500/30 font-semibold select-none">{authorUsername[0]?.toUpperCase() || "A"}</AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <p className="font-bold text-sm text-foreground truncate max-w-[80px]" data-testid={`text-username-${post.id}`}>
              {authorUsername}
            </p>
            {post.badges && post.badges.length > 0 ? (
              <div className="flex items-center gap-1 flex-shrink-0">
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
            <p className="text-xs text-muted-foreground/60 truncate max-w-[60px]" data-testid={`text-handle-${post.id}`}>
              @{authorHandle}
            </p>
            <span className="text-xs text-muted-foreground/60 flex-shrink-0">·</span>
            <p className="text-xs text-muted-foreground/60 flex-shrink-0 whitespace-nowrap" data-testid={`text-time-${post.id}`}>
              {post.timeAgo}
            </p>
          </div>

          {/* Caption Text - Right Below Header */}
          <p className="text-sm leading-relaxed mt-2 text-foreground" data-testid={`text-caption-${post.id}`}>
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
              className="hover-elevate active-elevate-2 flex-shrink-0"
              data-testid={`button-menu-${post.id}`}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isOwnPost && (
              <>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)} 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  data-testid={`button-delete-own-${post.id}`}
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  <span className="font-medium">Delete post</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {!isOwnPost && (
              <>
                <DropdownMenuItem 
                  onClick={() => {}}
                  className="cursor-pointer"
                  data-testid={`button-not-interested-${post.id}`}
                >
                  <Eye className="mr-3 h-4 w-4" />
                  <span>Not interested</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)} 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  data-testid={`button-report-${post.id}`}
                >
                  <Flag className="mr-3 h-4 w-4" />
                  <span>Report post</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                const postUrl = `${window.location.origin}/post/${post.id}`;
                navigator.clipboard.writeText(postUrl);
                toast({
                  title: "Link copied!",
                  description: "Post link copied to clipboard",
                });
              }}
              className="cursor-pointer"
              data-testid={`button-copy-link-${post.id}`}
            >
              <Copy className="mr-3 h-4 w-4" />
              <span>Copy link</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleBookmark}
              className="cursor-pointer"
              data-testid={`button-bookmark-menu-${post.id}`}
            >
              <Bookmark className={`mr-3 h-4 w-4 ${isBookmarked ? "fill-current text-primary" : ""}`} />
              <span>{isBookmarked ? "Unsave" : "Save"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer"
              data-testid={`button-share-menu-${post.id}`}
            >
              <Share2 className="mr-3 h-4 w-4" />
              <span>Share</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

      {/* Image Section - Rounded Corners */}
      <div 
        className="relative mx-4 mb-3 rounded-2xl overflow-hidden bg-gradient-to-br from-muted/40 to-muted/20" 
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage}
          alt="Post content"
          className="w-full aspect-square object-cover cursor-pointer select-none"
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
              className="w-28 h-28 text-white fill-white drop-shadow-lg" 
              style={{ animation: 'instagramHeartBurst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }} 
            />
          </div>
        )}
      </div>

      {/* Engagement Stats - Warm African Design */}
      <div className="px-4 py-3 flex justify-start gap-6 text-xs border-t border-border/10 bg-gradient-to-r from-background via-primary/5 to-background">
        <button className="flex items-center gap-2 font-medium transition-all hover-elevate text-muted-foreground hover:text-primary" onClick={() => onComment?.(post.id)} data-testid={`button-comments-stat-${post.id}`}>
          <MessageCircle className="h-4 w-4 text-primary" />
          <span>{post.comments}</span>
        </button>
        <button className="flex items-center gap-2 font-medium transition-all hover-elevate" onClick={handleLike} data-testid={`button-likes-stat-${post.id}`}>
          <Heart className={`h-4 w-4 transition-all ${isLiked ? "fill-red-600 text-red-600" : "text-muted-foreground"}`} />
          <span className={isLiked ? "text-red-600" : "text-muted-foreground"}>{likes}</span>
        </button>
        <button className="flex items-center gap-2 font-medium transition-all hover-elevate text-muted-foreground hover:text-foreground" data-testid={`button-views-stat-${post.id}`}>
          <Eye className="h-4 w-4" />
          <span>{Math.floor(post.likes * 0.5)}</span>
        </button>
      </div>

      {/* Comments Link */}
      {post.comments > 0 && (
        <button
          onClick={() => onComment?.(post.id)}
          className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          data-testid={`button-view-comments-${post.id}`}
        >
          View all {post.comments} {post.comments === 1 ? "comment" : "comments"}
        </button>
      )}
    </div>
  );
}
