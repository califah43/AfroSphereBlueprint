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
  id?: string;
  userId?: string;
  author?: {
    username: string;
    avatar?: string;
  };
  imageUrl?: string;
  image?: string;
  caption: string;
  likes?: number;
  comments?: number;
  timeAgo?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  category?: string;
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
}

export default function PostCard({ post, isOwnPost = false, onLike, onComment, onShare, onBookmark, onOpenShare, onAuthorClick }: PostCardProps) {
  // Handle both API response format and mock format
  const authorUsername = post.author?.username || post.userId || "unknown";
  const authorAvatar = post.author?.avatar;
  const imageUrl = post.imageUrl || post.image || "";
  const postId = post.id || "unknown";
  
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike?.(postId);

    if (!isLiked) {
      toast({
        title: "Post liked! ❤️",
        description: "Added to your liked posts",
      });
    }
  };

  const handleDoubleClick = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikes(likes + 1);
      onLike?.(postId);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(postId);

    toast({
      title: isBookmarked ? "Removed from saved" : "Post saved! 📌",
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
    <div className="bg-card rounded-lg overflow-hidden mb-4" data-testid={`card-post-${postId}`}>
      <div className="flex items-center justify-between p-4">
        <button 
          onClick={() => onAuthorClick?.(authorUsername)}
          className="flex items-center gap-3 hover-elevate flex-1 rounded px-2 py-1 transition-all group"
          data-testid={`button-author-profile-${postId}`}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={authorAvatar} />
            <AvatarFallback>{authorUsername[0]?.toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="font-semibold text-sm group-hover:text-primary transition-colors" data-testid={`text-username-${postId}`}>
              {authorUsername}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`text-time-${postId}`}>
              {post.timeAgo || "just now"}
            </p>
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover-elevate"
              data-testid={`button-menu-${postId}`}
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
                  data-testid={`button-delete-own-${postId}`}
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  <span className="font-medium">Delete post for me</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {!isOwnPost && (
              <>
                <DropdownMenuItem 
                  onClick={() => console.log("Not interested")}
                  className="cursor-pointer"
                  data-testid={`button-not-interested-${postId}`}
                >
                  <Eye className="mr-3 h-4 w-4" />
                  <span>Not interested</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)} 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  data-testid={`button-report-${postId}`}
                >
                  <Flag className="mr-3 h-4 w-4" />
                  <span className="font-medium">Report post</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem 
              onClick={() => {
                navigator.clipboard.writeText(`https://afrosphere.app/post/${postId}`);
                toast({
                  title: "Link copied!",
                  description: "Post link copied to clipboard",
                });
              }}
              className="cursor-pointer"
              data-testid={`button-copy-link-${postId}`}
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
                  ? "This action cannot be undone. The post will be removed only from your profile and view." 
                  : "Help us understand the problem. We'll review your report and take action if needed."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="hover:bg-muted">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className={isOwnPost ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}
              >
                {isOwnPost ? "Delete for me" : "Send Report"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="relative" onDoubleClick={handleDoubleClick}>
        <img
          src={imageUrl}
          alt="Post content"
          className="w-full aspect-[3/4] object-cover cursor-pointer"
          data-testid={`img-post-${postId}`}
        />
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart 
              className="w-28 h-28 text-white fill-white drop-shadow-lg" 
              style={{ animation: 'instagramHeartBurst 0.8s ease-out forwards' }} 
            />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className="hover-elevate active-elevate-2"
              data-testid={`button-like-${postId}`}
            >
              <Heart className={`h-6 w-6 ${isLiked ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onComment?.(postId)}
              className="hover-elevate active-elevate-2"
              data-testid={`button-comment-${postId}`}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onShare?.(postId);
                toast({
                  title: "Share sheet opened",
                  description: "Choose how you want to share this post",
                });
              }}
              className="hover-elevate active-elevate-2"
              data-testid={`button-share-${postId}`}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className="hover-elevate active-elevate-2"
            data-testid={`button-bookmark-${postId}`}
          >
            <Bookmark className={`h-6 w-6 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium transition-all duration-300" data-testid={`text-likes-${postId}`}>
            {likes.toLocaleString()} likes
          </p>
          <p className="text-sm">
            <span className="font-semibold">{authorUsername}</span>{" "}
            <span data-testid={`text-caption-${postId}`}>{post.caption}</span>
          </p>
          {(post.comments ?? 0) > 0 && (
            <button
              onClick={() => onComment?.(postId)}
              className="text-sm text-muted-foreground mt-1 hover:text-foreground"
              data-testid={`button-view-comments-${postId}`}
            >
              View all {post.comments} comments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}