import { Button } from "@/components/ui/button";
import { X, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import PostCard, { type Post } from "./PostCard";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

interface HashtagFeedProps {
  hashtag: string;
  onClose: () => void;
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: { username: "adikeafrica" },
    imageUrl: fashionImage,
    caption: "Bold Ankara prints meet modern streetwear. Fashion revolution! #AfricanFashion #Style",
    likes: 2341,
    comments: 156,
    timeAgo: "3h ago",
  },
  {
    id: "2",
    author: { username: "zara_style" },
    imageUrl: fashionImage,
    caption: "Traditional meets contemporary. This is our culture, our pride. #AfricanFashion",
    likes: 1876,
    comments: 94,
    timeAgo: "5h ago",
  },
  {
    id: "3",
    author: { username: "kwame_creative" },
    imageUrl: fashionImage,
    caption: "The future of African fashion is NOW. Celebrating our heritage. #AfricanFashion",
    likes: 3102,
    comments: 203,
    timeAgo: "1d ago",
  },
];

export default function HashtagFeed({ hashtag, onClose }: HashtagFeedProps) {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHashtagPosts = async () => {
      try {
        const res = await fetch(`/api/search/hashtag/${hashtag}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        if (data && data.length > 0) {
          const formattedPosts: Post[] = data.map((p: any) => ({
            id: p.id,
            author: { 
              id: p.authorId,
              username: p.username || "creator",
              uniqueUsername: p.uniqueUsername
            },
            imageUrl: p.image,
            caption: p.caption,
            likes: p.likes || 0,
            comments: p.commentCount || 0,
            timeAgo: p.createdAt ? `${Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 3600000)}h ago` : "now",
          }));
          setPosts(formattedPosts);
        }
      } catch (e) {
        console.log("Failed to fetch hashtag posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHashtagPosts();
  }, [hashtag]);

  const postCount = posts.length.toLocaleString();

  const [isFollowing, setIsFollowing] = useState(false);
  const userId = localStorage.getItem("currentUserId");

  useEffect(() => {
    if (userId && hashtag) {
      fetch(`/api/users/${userId}/followed-hashtags`)
        .then(res => res.json())
        .then(followed => {
          setIsFollowing(followed.includes(hashtag));
        })
        .catch(() => {});
    }
  }, [userId, hashtag]);

  const handleFollowToggle = async () => {
    if (!userId) return;
    const endpoint = isFollowing ? 'unfollow' : 'follow';
    try {
      const res = await fetch(`/api/hashtags/${hashtag}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (e) {
      console.error("Failed to toggle hashtag follow", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-hashtag">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold" data-testid="text-hashtag-title">
                {hashtag}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-post-count">
              {postCount} posts
            </p>
          </div>
          <Button 
            variant={isFollowing ? "outline" : "default"} 
            size="sm" 
            onClick={handleFollowToggle}
            data-testid="button-follow-hashtag"
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 pb-20">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={(id) => console.log("Liked:", id)}
              onComment={(id) => console.log("Comment:", id)}
              onShare={(id) => console.log("Share:", id)}
              onBookmark={(id) => console.log("Bookmark:", id)}
            />
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">No posts found for #{hashtag}</div>
        )}
      </div>
    </div>
  );
}
