import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export interface Post {
  id: string;
  author: {
    username: string;
    avatar?: string;
  };
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onOpenShare?: (postId: string) => void;
}

export default function PostCard({ post, onLike, onComment, onShare, onBookmark, onOpenShare }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likes, setLikes] = useState(post.likes);
  const [showHeart, setShowHeart] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike?.(post.id);

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
      onLike?.(post.id);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);

    toast({
      title: isBookmarked ? "Removed from saved" : "Post saved! 📌",
      description: isBookmarked ? "Removed from your collection" : "Added to your saved collection",
    });
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden mb-4" data-testid={`card-post-${post.id}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm" data-testid={`text-username-${post.id}`}>
              {post.author.username}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`text-time-${post.id}`}>
              {post.timeAgo}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-menu-${post.id}`}>
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuItem>Not interested</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative" onDoubleClick={handleDoubleClick}>
        <img
          src={post.imageUrl}
          alt="Post content"
          className="w-full aspect-[3/4] object-cover"
          data-testid={`img-post-${post.id}`}
        />
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-24 h-24 text-white fill-white animate-pulse" />
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
              data-testid={`button-like-${post.id}`}
            >
              <Heart className={`h-6 w-6 ${isLiked ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onComment?.(post.id)}
              className="hover-elevate active-elevate-2"
              data-testid={`button-comment-${post.id}`}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onShare?.(post.id);
                toast({
                  title: "Share sheet opened",
                  description: "Choose how you want to share this post",
                });
              }}
              className="hover-elevate active-elevate-2"
              data-testid={`button-share-${post.id}`}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className="hover-elevate active-elevate-2"
            data-testid={`button-bookmark-${post.id}`}
          >
            <Bookmark className={`h-6 w-6 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div>
          <p className="font-semibold text-sm mb-1" data-testid={`text-likes-${post.id}`}>
            {likes.toLocaleString()} likes
          </p>
          <p className="text-sm">
            <span className="font-semibold">{post.author.username}</span>{" "}
            <span data-testid={`text-caption-${post.id}`}>{post.caption}</span>
          </p>
          {post.comments > 0 && (
            <button
              onClick={() => onComment?.(post.id)}
              className="text-sm text-muted-foreground mt-1 hover:text-foreground"
              data-testid={`button-view-comments-${post.id}`}
            >
              View all {post.comments} comments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}