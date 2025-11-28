import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Trash2, Flag, Copy, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    username: string;
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
}

export default function PostCard({ post, isOwnPost = false, onLike, onComment, onShare, onBookmark, onOpenShare, onAuthorClick, onHashtagClick }: PostCardProps) {
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

  const handleDelete = () => {
    toast({
      title: "Post deleted",
      description: "Your post has been removed",
      variant: "destructive",
    });
    setShowDeleteDialog(false);
  };

  return (
    <div className="bg-background overflow-hidden mb-0 border-b border-border/20" data-testid={`card-post-${post.id}`}>
      {/* Image Section - FIRST */}
      <div 
        className="relative bg-gradient-to-br from-muted/40 to-muted/20 w-full" 
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
        
        {/* Image carousel indicators - TOP OF IMAGE */}
        {allImages.length > 1 && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-1 px-2.5 py-1.5 bg-primary/80 backdrop-blur-sm rounded-full">
            {allImages.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                data-testid={`indicator-image-${idx}`}
              />
            ))}
          </div>
        )}
        
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart 
              className="w-28 h-28 text-white fill-white drop-shadow-lg" 
              style={{ animation: 'instagramHeartBurst 0.8s ease-out forwards' }} 
            />
          </div>
        )}
      </div>

      {/* Engagement Stats Below Image - X/Twitter Style */}
      <div className="px-4 py-3 flex justify-between text-xs text-muted-foreground border-b border-border/10">
        <button className="hover:text-foreground transition-colors" data-testid={`button-comments-stat-${post.id}`}>
          <MessageCircle className="inline h-4 w-4 mr-1" /> {post.comments}
        </button>
        <button className="hover:text-foreground transition-colors" data-testid={`button-shares-stat-${post.id}`}>
          <Share2 className="inline h-4 w-4 mr-1" /> {Math.floor(post.likes * 0.3)}
        </button>
        <button className="hover:text-foreground transition-colors" onClick={handleLike} data-testid={`button-likes-stat-${post.id}`}>
          <Heart className={`inline h-4 w-4 mr-1 ${isLiked ? "fill-primary text-primary" : ""}`} /> {likes}
        </button>
        <button className="hover:text-foreground transition-colors" data-testid={`button-views-stat-${post.id}`}>
          <Eye className="inline h-4 w-4 mr-1" /> {Math.floor(post.likes * 0.5)}
        </button>
      </div>

      {/* Author Profile Below Stats */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
        <button 
          onClick={() => onAuthorClick?.(post.author.username)}
          className="flex items-center gap-2 hover-elevate flex-1 transition-all group"
          data-testid={`button-author-profile-${post.id}`}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-orange-500/30 text-xs font-semibold">{post.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-left min-w-0">
            <p className="font-bold text-sm text-foreground" data-testid={`text-username-${post.id}`}>
              {post.author.username}
            </p>
            <p className="text-xs text-muted-foreground/60" data-testid={`text-time-${post.id}`}>
              {post.timeAgo}
            </p>
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover-elevate active-elevate-2"
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
            <DropdownMenuItem 
              onClick={() => {
                navigator.clipboard.writeText(`https://afrosphere.app/post/${post.id}`);
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

      {/* Caption & Actions - LAST */}
      <div className="px-4 py-3 space-y-3">
        {/* Caption Section */}
        <p className="text-sm leading-relaxed">
          <span className="font-bold text-foreground">{post.author.username}</span>{" "}
          <span className="text-foreground/90" data-testid={`text-caption-${post.id}`}>
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
          </span>
        </p>

        {/* Comments Link */}
        {post.comments > 0 && (
          <button
            onClick={() => onComment?.(post.id)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-testid={`button-view-comments-${post.id}`}
          >
            View all {post.comments} {post.comments === 1 ? "comment" : "comments"}
          </button>
        )}

        {/* Action Buttons - Bottom */}
        <div className="flex items-center justify-between -mx-2 pt-2 border-t border-border/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment?.(post.id)}
            className="hover-elevate active-elevate-2 flex-1"
            data-testid={`button-comment-${post.id}`}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            <span className="text-xs">Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onShare?.(post.id);
            }}
            className="hover-elevate active-elevate-2 flex-1"
            data-testid={`button-share-${post.id}`}
          >
            <Share2 className="h-5 w-5 mr-2" />
            <span className="text-xs">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className="hover-elevate active-elevate-2 flex-1"
            data-testid={`button-bookmark-${post.id}`}
          >
            <Bookmark className={`h-5 w-5 mr-2 ${isBookmarked ? "fill-current text-primary" : ""}`} />
            <span className="text-xs">Save</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
