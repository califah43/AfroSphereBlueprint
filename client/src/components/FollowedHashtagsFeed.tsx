import { useState, useEffect, useRef } from "react";
import PostCard, { type Post } from "./PostCard";
import { Loader2, Tag } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";

interface FollowedHashtagsFeedProps {
  userId: string;
  onAuthorClick?: (username: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  onCommentClick?: (postId: string, imageUrl: string | string[], caption: string) => void;
  onPostClick?: (postId: string) => void;
}

export default function FollowedHashtagsFeed({
  userId,
  onAuthorClick,
  onHashtagClick,
  onCommentClick,
  onPostClick,
}: FollowedHashtagsFeedProps) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch posts from followed hashtags
  const { data: followedHashtags = [], isLoading: isHashtagsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'followed-hashtags'],
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/followed-hashtags`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch posts for followed hashtags
  const { data: hashtagPosts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['/api/posts/hashtags/followed', userId],
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (followedHashtags.length === 0) return [];
      const hashtags = followedHashtags.map((h: any) => h.tag).join(',');
      const res = await fetch(`/api/posts/hashtags?tags=${hashtags}`);
      if (!res.ok) return [];
      const posts = await res.json();
      return posts.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: followedHashtags.length > 0,
  });

  useEffect(() => {
    setPosts(hashtagPosts);
  }, [hashtagPosts]);

  if (isHashtagsLoading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (followedHashtags.length === 0) {
    return (
      <div className="pb-20 max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-4">
          <Tag className="h-7 w-7 text-primary/40" />
        </div>
        <p className="text-foreground font-semibold text-lg mb-2">No Followed Hashtags</p>
        <p className="text-sm text-muted-foreground">
          Follow hashtags to see posts about topics you care about
        </p>
      </div>
    );
  }

  if (posts.length === 0 && !isPostsLoading) {
    return (
      <div className="pb-20 max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-4">
          <Tag className="h-7 w-7 text-primary/40" />
        </div>
        <p className="text-foreground font-semibold text-lg mb-2">No Posts Yet</p>
        <p className="text-sm text-muted-foreground">
          Posts from {followedHashtags.length} followed hashtag{followedHashtags.length !== 1 ? 's' : ''} will appear here
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="pb-20"
      data-testid="container-followed-hashtags-feed"
    >
      {isPostsLoading && posts.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onAuthorClick={onAuthorClick}
              onHashtagClick={onHashtagClick}
              onComment={() => onCommentClick?.(post.id, post.images || [post.imageUrl], post.caption)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
