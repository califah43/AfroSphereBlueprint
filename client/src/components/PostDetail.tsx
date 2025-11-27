import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, X, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GENRES } from "@shared/genres";

interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  timeAgo: string;
}

interface PostDetailProps {
  postId: string;
  author: {
    username: string;
    avatar?: string;
  };
  imageUrl: string;
  caption: string;
  likes: number;
  timeAgo: string;
  comments: Comment[];
  genre?: string;
  onClose: () => void;
}

export default function PostDetail({
  postId,
  author,
  imageUrl,
  caption,
  likes: initialLikes,
  timeAgo,
  comments: initialComments,
  genre,
  onClose,
}: PostDetailProps) {
  const genreData = genre ? GENRES[genre.toUpperCase()] : null;
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: "you",
          text: newComment,
          likes: 0,
          timeAgo: "Just now",
        },
      ]);
      setNewComment("");
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-detail">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Post</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{author.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm" data-testid="text-detail-username">
                  {author.username}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                  {genreData && (
                    <Badge variant="outline" className="text-xs">
                      {genreData.emoji} {genreData.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-detail-menu">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Share to...</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <img
            src={imageUrl}
            alt="Post"
            className="w-full aspect-[3/4] object-cover"
            data-testid="img-detail-post"
          />

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLike}
                  data-testid="button-detail-like"
                >
                  <Heart className={`h-6 w-6 ${isLiked ? "fill-primary text-primary" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-detail-comment">
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" data-testid="button-detail-share">
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBookmarked(!isBookmarked)}
                data-testid="button-detail-bookmark"
              >
                <Bookmark className={`h-6 w-6 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>

            <div>
              <p className="font-semibold text-sm mb-2" data-testid="text-detail-likes">
                {likes.toLocaleString()} likes
              </p>
              <p className="text-sm">
                <span className="font-semibold">{author.username}</span>{" "}
                <span data-testid="text-detail-caption">{caption}</span>
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-3">Comments</h3>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3" data-testid={`detail-comment-${comment.id}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback>{comment.author[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{comment.author}</span>{" "}
                        {comment.text}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          {comment.likes} likes
                        </button>
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleComment} className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
            data-testid="input-detail-comment"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newComment.trim()}
            data-testid="button-detail-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
