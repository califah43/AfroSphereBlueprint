import { useState, useEffect } from "react";
import PostDetail from "./PostDetail";

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
}

export default function PostDetailModal({ postId, onClose }: PostDetailModalProps) {
  const [postData, setPostData] = useState<any>(null);
  const [postAuthor, setPostAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (res.ok) {
          const post = await res.json();
          setPostData(post);

          // Fetch author data
          const authorRes = await fetch(`/api/users/${post.userId}`);
          if (authorRes.ok) {
            const author = await authorRes.json();
            setPostAuthor(author);
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
      author={{ username: postAuthor?.username || "creator" }}
      imageUrl={postData.image}
      caption={postData.caption}
      likes={postData.likes}
      timeAgo={postData.createdAt ? new Date(postData.createdAt).toLocaleString() : "now"}
      comments={[]}
      onClose={onClose}
    />
  );
}
