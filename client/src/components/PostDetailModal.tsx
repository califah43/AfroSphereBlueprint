import { useState, useEffect } from "react";
import PostDetail from "./PostDetail";

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
}

export default function PostDetailModal({ postId, onClose }: PostDetailModalProps) {
  const [postData, setPostData] = useState<any>(null);
  const [postAuthor, setPostAuthor] = useState<any>(null);
  const [authorBadges, setAuthorBadges] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // Fetch post data
        const res = await fetch(`/api/posts/${postId}`);
        if (res.ok) {
          const post = await res.json();
          setPostData(post);

          // Fetch author data
          const authorRes = await fetch(`/api/users/${post.userId}`);
          if (authorRes.ok) {
            const author = await authorRes.json();
            setPostAuthor(author);

            // Fetch author badges
            const badgesRes = await fetch(`/api/badges/user/${author.id}`);
            if (badgesRes.ok) {
              const badges = await badgesRes.json();
              setAuthorBadges(Array.isArray(badges) ? badges : []);
            }
          }

          // Fetch comments for this post
          const commentsRes = await fetch(`/api/comments/post/${postId}`);
          if (commentsRes.ok) {
            const commentsData = await commentsRes.json();
            setComments(Array.isArray(commentsData) ? commentsData : []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <PostDetail
      postId={postId}
      author={{ 
        username: postAuthor?.username || "creator",
        avatar: postAuthor?.avatar || "",
        displayName: postAuthor?.displayName || postAuthor?.username || "creator",
        badges: authorBadges
      } as any}
      imageUrl={postData.image}
      caption={postData.caption}
      likes={postData.likes || 0}
      timeAgo={postData.createdAt ? new Date(postData.createdAt).toLocaleString() : "now"}
      comments={comments}
      genre={postData.category}
      onClose={onClose}
    />
  );
}
