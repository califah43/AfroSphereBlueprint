import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Send, Heart, MessageCircle } from "lucide-react";

interface Reply {
  id: string;
  author: string;
  text: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
  replies: Reply[];
}

interface CommentsProps {
  postId: string;
  postImage: string;
  postCaption: string;
  onClose: () => void;
}

export default function Comments({ postId, postImage, postCaption, onClose }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments/post/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Failed to fetch comments", error);
      }
    };
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            userId: "current-user",
            text: newComment,
            replyTo: null,
          }),
        });
        if (res.ok) {
          const newCommentObj = await res.json();
          setComments([...comments, { ...newCommentObj, replies: [] }]);
          setNewComment("");
        }
      } catch (error) {
        console.error("Failed to add comment", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddReply = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            userId: "current-user",
            text: replyText,
            replyTo: commentId,
          }),
        });
        if (res.ok) {
          const reply = await res.json();
          setComments(
            comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: [...c.replies, reply] }
                : c
            )
          );
          setReplyText("");
          setReplyingTo(null);
        }
      } catch (error) {
        console.error("Failed to add reply", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likes: c.isLiked ? c.likes - 1 : c.likes + 1,
            }
          : c
      )
    );
  };

  const toggleReplyLike = (commentId: string, replyId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r.id === replyId
                  ? {
                      ...r,
                      isLiked: !r.isLiked,
                      likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                    }
                  : r
              ),
            }
          : c
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-background via-background to-primary/5 border-b border-primary/10 px-4 py-3 flex items-center justify-between backdrop-blur-sm z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-primary/10"
          data-testid="button-close-comments"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold text-primary" data-testid="text-comments-title">
          Comments
        </h2>
        <div className="w-10" />
      </div>

      {/* Post Preview */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent border-b border-primary/10 px-4 py-4">
        <div className="flex gap-3">
          <img
            src={postImage}
            alt="Post"
            className="w-12 h-12 object-cover rounded-lg border border-primary/20"
            data-testid="img-post-thumbnail"
          />
          <p className="text-sm flex-1 line-clamp-2 text-slate-300" data-testid="text-post-caption">
            {postCaption}
          </p>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {comments.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No comments yet. Be the first!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-3" data-testid={`comment-${comment.id}`}>
              {/* Main Comment */}
              <div className="flex gap-3">
                <Avatar className="w-9 h-9 border border-primary/20 flex-shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {comment.author[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="bg-slate-800/50 border border-primary/10 rounded-xl px-4 py-3">
                    <p className="font-semibold text-sm text-primary" data-testid={`text-comment-author-${comment.id}`}>
                      {comment.author}
                    </p>
                    <p className="text-sm text-slate-200 mt-1 break-words" data-testid={`text-comment-text-${comment.id}`}>
                      {comment.text}
                    </p>
                  </div>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 mt-2 px-2 text-xs text-slate-400">
                    <span className="font-medium" data-testid={`text-comment-time-${comment.id}`}>
                      {comment.timeAgo}
                    </span>
                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className="hover:text-primary transition-colors flex items-center gap-1"
                      data-testid={`button-like-comment-${comment.id}`}
                    >
                      <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-primary text-primary" : ""}`} />
                      <span className={comment.isLiked ? "text-primary font-semibold" : ""}>
                        {comment.likes}
                      </span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="hover:text-primary transition-colors flex items-center gap-1"
                      data-testid={`button-reply-comment-${comment.id}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleAddReply(comment.id, e)} className="ml-12 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-slate-800/50 border border-primary/20 rounded-lg"
                      data-testid={`input-reply-${comment.id}`}
                      autoFocus
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!replyText.trim() || isLoading}
                      className="bg-primary hover:bg-primary/90"
                      data-testid={`button-send-reply-${comment.id}`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-9 space-y-3 border-l-2 border-primary/20 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3" data-testid={`reply-${reply.id}`}>
                      <Avatar className="w-8 h-8 border border-primary/10 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary/70 text-xs font-bold">
                          {reply.author[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-900/50 border border-primary/5 rounded-lg px-3 py-2">
                          <p className="font-semibold text-xs text-primary/80" data-testid={`text-reply-author-${reply.id}`}>
                            {reply.author}
                          </p>
                          <p className="text-sm text-slate-300 mt-0.5 break-words" data-testid={`text-reply-text-${reply.id}`}>
                            {reply.text}
                          </p>
                        </div>

                        {/* Reply Actions */}
                        <div className="flex items-center gap-3 mt-1 px-1 text-xs text-slate-500">
                          <span data-testid={`text-reply-time-${reply.id}`}>{reply.timeAgo}</span>
                          <button
                            onClick={() => toggleReplyLike(comment.id, reply.id)}
                            className="hover:text-primary transition-colors flex items-center gap-1"
                            data-testid={`button-like-reply-${reply.id}`}
                          >
                            <Heart className={`h-3 w-3 ${reply.isLiked ? "fill-primary text-primary" : ""}`} />
                            <span className={reply.isLiked ? "text-primary font-semibold" : ""}>{reply.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="bg-gradient-to-t from-background via-background to-transparent border-t border-primary/10 px-4 py-4 backdrop-blur-sm">
        <div className="flex gap-2">
          <Avatar className="w-9 h-9 border border-primary/20 flex-shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">Y</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2 min-w-0">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-slate-800/50 border border-primary/20 rounded-lg"
              data-testid="input-new-comment"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 flex-shrink-0"
              data-testid="button-send-comment"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
