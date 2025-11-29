import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BadgeDisplay from "./BadgeDisplay";
import { X, Send, Heart, ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Reply {
  id: string;
  author: string;
  text: string;
  likes: number;
  timeAgo: string;
  isLiked?: boolean;
  avatar?: string;
  userId?: string;
  badges?: any[];
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
  userId?: string;
  badges?: any[];
}

interface CommentsProps {
  postId: string;
  postImage: string;
  postCaption: string;
  onClose: () => void;
  onCommentAdded?: (updatedCommentCount: number) => void;
}

export default function Comments({ postId, postImage, postCaption, onClose, onCommentAdded }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
    setCurrentUser(userData);
  }, []);

  useEffect(() => {
    // Clear comments immediately when postId changes to prevent stale data
    setComments([]);
    setReplyingTo(null);
    setReplyText("");
    setExpandedReplies(new Set());
    
    const fetchComments = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
        const userId = userData?.id || "";
        
        // Pass userId as query param to get proper isLiked status
        const url = userId 
          ? `/api/comments/post/${postId}?userId=${userId}`
          : `/api/comments/post/${postId}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Filter to only top-level comments (replyTo is null)
          // Replies are already nested in the replies array
          const mappedComments = data
            .filter((c: any) => !c.replyTo)
            .map((c: any) => ({
              id: c.id,
              author: c.author || "creator",
              text: c.text,
              likes: c.likes || 0,
              timeAgo: c.timeAgo || "now",
              isLiked: c.isLiked === true,
              userId: c.userId,
              badges: c.badges || [],
              replies: (c.replies || []).map((r: any) => ({
                id: r.id,
                author: r.author || "creator",
                text: r.text,
                likes: r.likes || 0,
                timeAgo: r.timeAgo || "now",
                isLiked: r.isLiked === true,
                avatar: r.avatar || "",
                userId: r.userId,
                badges: r.badges || [],
              })),
              avatar: c.avatar || "",
            }));
          setComments(mappedComments);
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
        // Get the REAL database UUID, not Firebase UID
        let currentUserId = localStorage.getItem("currentUserId");
        const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
        
        // If currentUserId looks like a Firebase UID, use the database ID from userData
        if (userData && userData.id && userData.id !== currentUserId) {
          currentUserId = userData.id;
        }
        
        if (!currentUserId) {
          throw new Error("User not authenticated");
        }
        
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId,
            userId: currentUserId,
            username: userData.username || "creator",
            text: newComment,
            replyTo: null,
          }),
        });
        if (res.ok) {
          const newCommentObj = await res.json();
          const mappedComment: Comment = {
            id: newCommentObj.id,
            author: newCommentObj.author || userData.username || "creator",
            text: newCommentObj.text,
            likes: newCommentObj.likes || 0,
            timeAgo: newCommentObj.timeAgo || "now",
            isLiked: false,
            replies: [],
            avatar: newCommentObj.avatar || userData.avatar,
            userId: currentUserId,
            badges: newCommentObj.badges || [],
          };
          setComments([...comments, mappedComment]);
          setNewComment("");
          
          // Fetch updated post to get fresh comment count
          try {
            const postRes = await fetch(`/api/posts/${postId}`);
            if (postRes.ok) {
              const postData = await postRes.json();
              onCommentAdded?.(postData.commentCount || comments.length + 1);
            }
          } catch (e) {
            // Fallback: just increment count locally
            onCommentAdded?.(comments.length + 1);
          }
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
          const mappedReply: Reply = {
            id: reply.id,
            author: reply.author || "creator",
            text: reply.text,
            likes: reply.likes || 0,
            timeAgo: reply.timeAgo || "now",
            isLiked: false,
            avatar: reply.avatar,
          };
          setComments(
            comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: [...c.replies, mappedReply] }
                : c
            )
          );
          setReplyText("");
          setReplyingTo(null);
          
          // Fetch updated post to get fresh comment count
          try {
            const postRes = await fetch(`/api/posts/${postId}`);
            if (postRes.ok) {
              const postData = await postRes.json();
              onCommentAdded?.(postData.commentCount || comments.length + 1);
            }
          } catch (e) {
            // Fallback: just increment count locally
            onCommentAdded?.(comments.length + 1);
          }
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

  const toggleCommentLike = async (commentId: string) => {
    let userId = localStorage.getItem("currentUserId");
    const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
    
    if (userData && userData.id && userData.id !== userId) {
      userId = userData.id;
    }
    
    if (!userId) return;

    const comment = comments.find(c => c.id === commentId);
    const isCurrentlyLiked = comment?.isLiked || false;

    // Update UI optimistically
    setComments(
      comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              isLiked: !c.isLiked,
              likes: c.isLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
            }
          : c
      )
    );

    // Persist to server
    try {
      await fetch('/api/likes/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, commentId }),
      });
    } catch (error) {
      // Revert on error
      setComments(
        comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: isCurrentlyLiked,
                likes: isCurrentlyLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
              }
            : c
        )
      );
    }
  };

  const toggleReplyLike = async (commentId: string, replyId: string) => {
    let userId = localStorage.getItem("currentUserId");
    const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
    
    if (userData && userData.id && userData.id !== userId) {
      userId = userData.id;
    }
    
    if (!userId) return;

    const comment = comments.find(c => c.id === commentId);
    const reply = comment?.replies.find(r => r.id === replyId);
    const isCurrentlyLiked = reply?.isLiked || false;

    // Update UI optimistically
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
                      likes: r.isLiked ? Math.max(0, r.likes - 1) : r.likes + 1,
                    }
                  : r
              ),
            }
          : c
      )
    );

    // Persist to server
    try {
      await fetch('/api/likes/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, commentId: replyId }),
      });
    } catch (error) {
      // Revert on error
      setComments(
        comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === replyId
                    ? {
                        ...r,
                        isLiked: isCurrentlyLiked,
                        likes: isCurrentlyLiked ? r.likes + 1 : Math.max(0, r.likes - 1),
                      }
                    : r
                ),
              }
            : c
        )
      );
    }
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
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm text-foreground" data-testid={`text-comment-author-${comment.id}`}>
                          {comment.author || "Anonymous"}
                        </p>
                        {comment.badges && comment.badges.length > 0 && (
                          <div className="flex items-center gap-1">
                            {comment.badges.map((badge: any) => (
                              <div key={badge.id} className="w-4 h-4 inline-block" title={badge.name}>
                                <img 
                                  src={`data:image/svg+xml;base64,${btoa(badge.iconSvg)}`} 
                                  alt={badge.name}
                                  className="w-full h-full"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">@{comment.author || "user"}</p>
                      <span className="text-xs text-muted-foreground font-medium">·</span>
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
                      {t("comments.reply")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleAddReply(comment.id, e)} className="ml-12 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-2 items-end">
                    <Avatar className="w-7 h-7 border border-border/50 flex-shrink-0">
                      {currentUser?.avatar && <AvatarImage src={currentUser.avatar} alt={currentUser.username} />}
                      <AvatarFallback className="bg-primary/10 text-primary/70 text-xs font-bold">
                        {(currentUser?.username || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      placeholder={t("comments.writeReply")}
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
                      className="bg-primary hover:bg-primary/90 rounded-full h-9 w-9 flex-shrink-0"
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
                              <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <p className="font-semibold text-xs text-foreground/90" data-testid={`text-reply-author-${reply.id}`}>
                                    {reply.author || "Anonymous"}
                                  </p>
                                  {reply.badges && reply.badges.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {reply.badges.map((badge: any) => (
                                        <div key={badge.id} className="w-4 h-4 inline-block" title={badge.name}>
                                          <img 
                                            src={`data:image/svg+xml;base64,${btoa(badge.iconSvg)}`} 
                                            alt={badge.name}
                                            className="w-full h-full"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground/70">@{reply.author || "user"}</p>
                                <span className="text-xs text-muted-foreground/70">·</span>
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
            {currentUser?.avatar && <AvatarImage src={currentUser.avatar} alt={currentUser.username} />}
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-orange-400/30 text-primary text-xs font-bold">
              {(currentUser?.username || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2 min-w-0">
            <Input
              placeholder={t("comments.addComment")}
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
