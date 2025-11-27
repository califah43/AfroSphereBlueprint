import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Send, Heart, Reply as ReplyIcon } from "lucide-react";

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

const mockComments: Comment[] = [
  {
    id: "1",
    author: "zara_style",
    text: "This is absolutely stunning! The colors are perfect 🔥",
    likes: 23,
    timeAgo: "1h ago",
    isLiked: false,
    replies: [
      {
        id: "1-1",
        author: "adikeafrica",
        text: "Thank you! Took forever to style this",
        likes: 5,
        timeAgo: "55m ago",
        isLiked: false,
      },
      {
        id: "1-2",
        author: "kwame_creative",
        text: "Right? It's insane",
        likes: 2,
        timeAgo: "50m ago",
        isLiked: false,
      },
    ],
  },
  {
    id: "2",
    author: "kwame_creative",
    text: "Love the fusion of traditional and modern!",
    likes: 15,
    timeAgo: "45m ago",
    isLiked: false,
    replies: [],
  },
  {
    id: "3",
    author: "amara_fashion",
    text: "Where can I get this? Need it!",
    likes: 8,
    timeAgo: "30m ago",
    isLiked: false,
    replies: [
      {
        id: "3-1",
        author: "zara_style",
        text: "I found it on @africancouture_market",
        likes: 3,
        timeAgo: "25m ago",
        isLiked: false,
      },
    ],
  },
];

export default function Comments({ postId, postImage, postCaption, onClose }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleAddComment = (e: React.FormEvent) => {
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
          isLiked: false,
          replies: [],
        },
      ]);
      setNewComment("");
    }
  };

  const handleAddReply = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [
                  ...comment.replies,
                  {
                    id: `${commentId}-${Date.now()}`,
                    author: "you",
                    text: replyText,
                    likes: 0,
                    timeAgo: "Just now",
                    isLiked: false,
                  },
                ],
              }
            : comment
        )
      );
      setReplyText("");
      setReplyingTo(null);
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
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-background via-background to-primary/5 border-b border-primary/10 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
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
      <div className="sticky top-14 bg-gradient-to-b from-primary/5 to-transparent border-b border-primary/10 p-4">
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
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-3" data-testid={`comment-${comment.id}`}>
              {/* Main Comment */}
              <div className="flex gap-3 group">
                <Avatar className="w-9 h-9 border border-primary/20 flex-shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {comment.author[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-primary/10 rounded-xl px-4 py-3 hover:border-primary/20 transition-colors">
                    <p className="font-semibold text-sm text-primary" data-testid={`text-comment-author-${comment.id}`}>
                      {comment.author}
                    </p>
                    <p className="text-sm text-slate-200 mt-1" data-testid={`text-comment-text-${comment.id}`}>
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
                      <Heart
                        className={`h-4 w-4 ${
                          comment.isLiked ? "fill-primary text-primary" : ""
                        }`}
                      />
                      <span className={comment.isLiked ? "text-primary font-semibold" : ""}>
                        {comment.likes} {comment.likes === 1 ? "like" : "likes"}
                      </span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="hover:text-primary transition-colors flex items-center gap-1"
                      data-testid={`button-reply-comment-${comment.id}`}
                    >
                      <ReplyIcon className="h-4 w-4" />
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
                      className="bg-slate-800/50 border border-primary/20 rounded-lg focus:border-primary/50"
                      data-testid={`input-reply-${comment.id}`}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!replyText.trim()}
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

                      <div className="flex-1">
                        <div className="bg-slate-900/50 border border-primary/5 rounded-lg px-3 py-2 hover:border-primary/10 transition-colors">
                          <p className="font-semibold text-xs text-primary/80" data-testid={`text-reply-author-${reply.id}`}>
                            {reply.author}
                          </p>
                          <p className="text-sm text-slate-300 mt-0.5" data-testid={`text-reply-text-${reply.id}`}>
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
                            <Heart
                              className={`h-3 w-3 ${
                                reply.isLiked ? "fill-primary text-primary" : ""
                              }`}
                            />
                            <span className={reply.isLiked ? "text-primary font-semibold" : ""}>
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
          ))
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent border-t border-primary/10 p-4 backdrop-blur-sm">
        <div className="flex gap-2">
          <Avatar className="w-9 h-9 border border-primary/20 flex-shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary font-bold">Y</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-slate-800/50 border border-primary/20 rounded-lg focus:border-primary/50 placeholder:text-slate-500"
              data-testid="input-new-comment"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim()}
              className="bg-primary hover:bg-primary/90"
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
