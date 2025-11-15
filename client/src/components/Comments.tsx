import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Send, Heart } from "lucide-react";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";

interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
}

interface CommentsProps {
  postId: string;
  postImage: string;
  postCaption: string;
  onClose: () => void;
}

const mockComments: Comment[] = [
  { id: "1", author: "zara_style", text: "This is absolutely stunning! 🔥", likes: 23, timeAgo: "1h ago" },
  { id: "2", author: "kwame_creative", text: "Love the fusion of traditional and modern!", likes: 15, timeAgo: "45m ago" },
  { id: "3", author: "amara_fashion", text: "Where can I get this? Need it!", likes: 8, timeAgo: "30m ago" },
];

export default function Comments({ postId, postImage, postCaption, onClose }: CommentsProps) {
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      console.log("New comment:", newComment);
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
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-comments">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold" data-testid="text-comments-title">Comments</h2>
        <div className="w-10" />
      </div>

      <div className="sticky top-14 bg-background border-b border-border p-4">
        <div className="flex gap-3">
          <img
            src={postImage}
            alt="Post"
            className="w-12 h-12 object-cover rounded"
            data-testid="img-post-thumbnail"
          />
          <p className="text-sm flex-1 line-clamp-2" data-testid="text-post-caption">
            {postCaption}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
            <Avatar className="w-8 h-8">
              <AvatarFallback>{comment.author[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded-lg px-3 py-2">
                <p className="font-semibold text-sm" data-testid={`text-comment-author-${comment.id}`}>
                  {comment.author}
                </p>
                <p className="text-sm" data-testid={`text-comment-text-${comment.id}`}>
                  {comment.text}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-1 px-3">
                <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  {comment.likes} likes
                </button>
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  Reply
                </button>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-like-comment-${comment.id}`}>
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
            data-testid="input-new-comment"
          />
          <Button type="submit" size="icon" disabled={!newComment.trim()} data-testid="button-send-comment">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
