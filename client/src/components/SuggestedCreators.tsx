import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CreatorBadge, { type BadgeType } from "./CreatorBadge";

interface Creator {
  username: string;
  name: string;
  bio: string;
  followers: string;
  avatar?: string;
  badge?: BadgeType;
}

const suggestedCreators: Creator[] = [
  {
    username: "adikeafrica",
    name: "Adike Africa",
    bio: "Celebrating our roots with modern style. Ankara fusion fashion.",
    followers: "12.5K",
    badge: "fashion-vanguard",
  },
  {
    username: "beat_masta",
    name: "Beat Masta",
    bio: "Afrobeats meets amapiano. New music dropping Friday!",
    followers: "9.8K",
    badge: "music-star",
  },
  {
    username: "kojoart",
    name: "Kojo Art",
    bio: "New pieces inspired by Adinkra symbols. Contemporary African art.",
    followers: "7.3K",
    badge: "top-artist",
  },
];

export default function SuggestedCreators() {
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const toggleFollow = async (username: string) => {
    setLoading((prev) => ({ ...prev, [username]: true }));
    try {
      const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
      const currentUserId = currentUserData?.id;
      
      if (!currentUserId) {
        toast({
          title: "Error",
          description: "Not logged in",
          variant: "destructive",
        });
        setLoading((prev) => ({ ...prev, [username]: false }));
        return;
      }
      
      // Fetch target user by username to get their ID
      const userRes = await fetch(`/api/users/username/${username}`);
      if (!userRes.ok) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        setLoading((prev) => ({ ...prev, [username]: false }));
        return;
      }
      
      const targetUser = await userRes.json();
      const targetUserId = targetUser.id;
      
      const isFollowing = followStates[username];
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          followerId: currentUserId, 
          followingId: targetUserId 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setFollowStates((prev) => ({ ...prev, [username]: data.following }));
        toast({
          title: data.following ? "Following" : "Unfollowed",
          description: data.following ? `You're now following @${username}` : `You unfollowed @${username}`,
          className: "border-primary/20 bg-card",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isFollowing ? 'unfollow' : 'follow'} @${username}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast({
        title: "Connection Error",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [username]: false }));
    }
  };

  return (
    <Card data-testid="container-suggested-creators">
      <CardHeader>
        <CardTitle>Suggested Creators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedCreators.map((creator) => (
          <div
            key={creator.username}
            className="flex items-start gap-3"
            data-testid={`suggested-${creator.username}`}
          >
            <Avatar className="w-12 h-12 shrink-0">
              <AvatarFallback>{creator.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm truncate">{creator.username}</p>
              </div>
              {creator.badge && (
                <div className="mb-1">
                  <CreatorBadge type={creator.badge} size="sm" />
                </div>
              )}
              <p className="text-xs text-muted-foreground line-clamp-2">{creator.bio}</p>
              <p className="text-xs text-muted-foreground mt-1">{creator.followers} followers</p>
            </div>
            <Button
              size="sm"
              variant={followStates[creator.username] ? "outline" : "default"}
              onClick={() => toggleFollow(creator.username)}
              disabled={loading[creator.username]}
              data-testid={`button-follow-suggested-${creator.username}`}
              className="shrink-0 self-start mt-1"
            >
              {loading[creator.username] ? "..." : (followStates[creator.username] ? "Following" : "Follow")}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}