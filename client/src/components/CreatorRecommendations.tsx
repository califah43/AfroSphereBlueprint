import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";

interface RecommendedCreator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  followers: number;
  bio: string;
}

interface CreatorRecommendationsProps {
  userId?: string;
  onCreatorClick?: (username: string) => void;
  limit?: number;
}

export default function CreatorRecommendations({ userId, onCreatorClick, limit = 6 }: CreatorRecommendationsProps) {
  const [creators, setCreators] = useState<RecommendedCreator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingState, setFollowingState] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const viewerIdParam = userId ? `&viewerId=${userId}` : "";
        const res = await fetch(`/api/users/recommended?limit=${limit}${viewerIdParam}`);
        if (res.ok) {
          const data = await res.json();
          setCreators(data);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, limit]);

  const handleFollow = async (creatorId: string) => {
    if (!userId) return;

    try {
      const isFollowing = followingState.has(creatorId);
      const res = await fetch(isFollowing ? `/api/follows/${creatorId}` : "/api/follows", {
        method: isFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: userId,
          followingId: creatorId,
        }),
      });

      if (res.ok) {
        setFollowingState((prev) => {
          const newSet = new Set(prev);
          if (isFollowing) {
            newSet.delete(creatorId);
          } else {
            newSet.add(creatorId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (creators.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4 px-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground">Suggested Creators</h3>
      </div>

      <div className="space-y-2 px-4">
        {creators.map((creator) => (
          <button
            key={creator.id}
            onClick={() => onCreatorClick?.(creator.username)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover-elevate bg-card/50 transition-all"
            data-testid={`creator-recommendation-${creator.username}`}
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={creator.avatar} alt={creator.displayName} />
              <AvatarFallback>{creator.displayName?.[0] || "?"}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{creator.displayName}</p>
              <p className="text-xs text-muted-foreground">{creator.followers} followers</p>
            </div>

            {userId && (
              <Button
                size="sm"
                variant={followingState.has(creator.id) ? "outline" : "default"}
                className="flex-shrink-0 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollow(creator.id);
                }}
                data-testid={`button-follow-${creator.username}`}
              >
                {followingState.has(creator.id) ? "Following" : "Follow"}
              </Button>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
