import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Send, Heart, ChevronDown } from "lucide-react";

interface Reply {
  id: string;
  author: string;
  text: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
  avatar?: string;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
  replies: Reply[];
  avatar?: string;
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
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

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
        const currentUserId = localStorage.getItem("currentUserId");
        const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            userId: currentUserId,
            username: userData.username,
            text: newComment,
            replyTo: null,
          }),
        });
        if (res.ok) {
          const newCommentObj = await res.json();
          setComments([...comments, { ...newCommentObj, replies: [] }]);
          setNewComment("");
        } else {
          console.error("Failed to post comment:", res.status);
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
        const currentUserId = localStorage.getItem("currentUserId");
        const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            userId: currentUserId,
            username: userData.username,
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
        } else {
          console.error("Failed to post reply:", res.status);
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

  const toggleRepliesExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col overflow-hidden rounded-t-3xl md:rounded-2xl">
      {/* Header with Gradient */}
      <div className="sticky top-0 bg-gradient-to-b from-background via-background to-transparent border-b border-border/30 px-4 py-4 flex items-center justify-between backdrop-blur-md z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover-elevate h-9 w-9 rounded-full"
          data-testid="button-close-comments"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-black tracking-tight bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent" data-testid="text-comments-title">
          Comments
        </h2>
        <div className="w-9" />
      </div>

      {/* Post Preview - Elegant Card */}
      <div className="mx-4 mt-3 mb-4 p-3 rounded-xl bg-card border border-border/50 backdrop-blur-sm hover-elevate transition-all">
        <div className="flex gap-3 items-start">
          <img
            src={postImage}
            alt="Post"
            className="w-14 h-14 object-cover rounded-lg border border-border"
            data-testid="img-post-thumbnail"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Post</p>
            <p className="text-sm line-clamp-2 text-foreground leading-snug" data-testid="text-post-caption">
              {postCaption}
            </p>
          </div>
        </div>
      </div>

      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Heart className="h-6 w-6 text-primary/40" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No comments yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Be the first to share your thoughts</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid={`comment-${comment.id}`}>
              {/* Main Comment */}
              <div className="flex gap-3 group">
                <Avatar className="w-9 h-9 border border-border flex-shrink-0 mt-0.5">
                  {comment.avatar ? (
                    <AvatarImage src={comment.avatar} alt={comment.author || "User"} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-orange-400/30 text-primary text-xs font-bold">
                    {(comment.author || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Comment Bubble */}
                  <div className="bg-card border border-border/50 rounded-2xl px-4 py-3 group-hover:border-primary/30 transition-all duration-200">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="font-semibold text-sm text-foreground" data-testid={`text-comment-author-${comment.id}`}>
                        {comment.author || "Anonymous"}
                      </p>
                      <span className="text-xs text-muted-foreground font-medium" data-testid={`text-comment-time-${comment.id}`}>
                        {comment.timeAgo}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 break-words leading-relaxed" data-testid={`text-comment-text-${comment.id}`}>
                      {comment.text}
                    </p>
                  </div>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-3 mt-2 px-1">
                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`button-like-comment-${comment.id}`}
                    >
                      <Heart className={`h-4 w-4 transition-all ${comment.isLiked ? "fill-primary text-primary scale-110" : ""}`} />
                      <span className={comment.isLiked ? "text-primary" : ""}>
                        {comment.likes}
                      </span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`button-reply-comment-${comment.id}`}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleAddReply(comment.id, e)} className="ml-12 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-card border border-border/50 rounded-full text-sm px-4 focus:border-primary/50"
                      data-testid={`input-reply-${comment.id}`}
                      autoFocus
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!replyText.trim() || isLoading}
                      className="bg-primary hover:bg-primary/90 rounded-full h-9 w-9"
                      data-testid={`button-send-reply-${comment.id}`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}

              {/* Replies Section */}
              {comment.replies.length > 0 && (
                <div className="ml-9 space-y-2">
                  {/* Replies Toggle */}
                  {comment.replies.length > 2 && !expandedReplies.has(comment.id) && (
                    <button
                      onClick={() => toggleRepliesExpanded(comment.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors pl-3 py-1"
                    >
                      <ChevronDown className="h-3 w-3" />
                      View {comment.replies.length} replies
                    </button>
                  )}

                  {/* Replies List */}
                  {(expandedReplies.has(comment.id) || comment.replies.length <= 2) && (
                    <div className="space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200" data-testid={`reply-${reply.id}`}>
                          <Avatar className="w-8 h-8 border border-border/50 flex-shrink-0 mt-0.5">
                            {reply.avatar ? (
                              <AvatarImage src={reply.avatar} alt={reply.author || "User"} />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary/70 text-xs font-bold">
                              {(reply.author || "U")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            {/* Reply Bubble - Subtler */}
                            <div className="bg-background border border-border/30 rounded-xl px-3 py-2">
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <p className="font-semibold text-xs text-foreground/90" data-testid={`text-reply-author-${reply.id}`}>
                                  {reply.author || "Anonymous"}
                                </p>
                                <span className="text-xs text-muted-foreground/70" data-testid={`text-reply-time-${reply.id}`}>
                                  {reply.timeAgo}
                                </span>
                              </div>
                              <p className="text-xs text-foreground/70 break-words leading-relaxed" data-testid={`text-reply-text-${reply.id}`}>
                                {reply.text}
                              </p>
                            </div>

                            {/* Reply Actions */}
                            <div className="flex items-center gap-3 mt-1 px-1">
                              <button
                                onClick={() => toggleReplyLike(comment.id, reply.id)}
                                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                                data-testid={`button-like-reply-${reply.id}`}
                              >
                                <Heart className={`h-3 w-3 transition-all ${reply.isLiked ? "fill-primary text-primary scale-110" : ""}`} />
                                <span className={reply.isLiked ? "text-primary" : ""}>
                                  {reply.likes}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Comment Input Footer */}
      <form onSubmit={handleAddComment} className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent border-t border-border/30 px-4 py-4 backdrop-blur-md">
        <div className="flex gap-3 items-end">
          <Avatar className="w-9 h-9 border border-border flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-orange-400/30 text-primary text-xs font-bold">
              Y
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2 min-w-0">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-card border border-border/50 rounded-full text-sm px-4 focus:border-primary/50 placeholder:text-muted-foreground/60"
              data-testid="input-new-comment"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 rounded-full h-9 w-9 flex-shrink-0 transition-all duration-200"
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
