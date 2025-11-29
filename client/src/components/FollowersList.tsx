import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Heart, Users, Lightbulb, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isFollowing?: boolean;
}

interface FollowersListProps {
  username: string;
  followerCount: string;
  followingCount: string;
  onClose: () => void;
  onUserClick?: (username: string) => void;
}

export default function FollowersList({
  username,
  followerCount,
  followingCount,
  onClose,
  onUserClick,
}: FollowersListProps) {
  const [activeTab, setActiveTab] = useState("followers");
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleUnfollow = async (targetUsername: string) => {
    try {
      const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
      const currentUserId = currentUserData?.id;
      
      if (!currentUserId) {
        toast({
          title: "Error",
          description: "Not logged in",
          variant: "destructive",
        });
        return;
      }
      
      // Fetch target user by username to get their ID
      const userRes = await fetch(`/api/users/username/${targetUsername}`);
      if (!userRes.ok) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
      }
      
      const targetUser = await userRes.json();
      const targetUserId = targetUser.id;
      
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
        // Remove user from following list immediately
        setFollowing(prev => prev.filter(user => user.username !== targetUsername));
        
        // Update current user's following count
        currentUserData.followingCount = Math.max(0, (currentUserData.followingCount || 1) - 1);
        localStorage.setItem("currentUserData", JSON.stringify(currentUserData));
        
        // Dispatch event to notify Profile component
        window.dispatchEvent(new CustomEvent('followingCountUpdated', { detail: { followingCount: currentUserData.followingCount } }));
        
        toast({
          title: "Unfollowed",
          description: `You unfollowed @${targetUsername}`,
          className: "border-primary/20 bg-card",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to unfollow",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to unfollow:', error);
      toast({
        title: "Connection Error",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
        
        // Fetch user by username to get their ID
        const userRes = await fetch(`/api/users/username/${username}`);
        if (!userRes.ok) {
          setIsLoading(false);
          return;
        }
        
        const user = await userRes.json();
        const userId = user.id;
        
        // Fetch followers and following
        const [followersRes, followingRes] = await Promise.all([
          fetch(`/api/follows/followers/${userId}`),
          fetch(`/api/follows/following/${userId}`)
        ]);
        
        if (followersRes.ok) {
          const followersData = await followersRes.json();
          setFollowers(Array.isArray(followersData) ? followersData : []);
        }
        
        if (followingRes.ok) {
          const followingData = await followingRes.json();
          setFollowing(Array.isArray(followingData) ? followingData : []);
        }
      } catch (error) {
        console.log("Failed to fetch followers/following:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFollowData();
  }, [username]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            data-testid="button-close-followers"
            className="hover-elevate"
          >
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-bold" data-testid="text-followers-title">
              @{username}
            </h2>
            <p className="text-xs text-muted-foreground">Network</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="sticky top-16 bg-background border-b border-border px-0 z-10">
          <TabsList className="w-full grid grid-cols-2 bg-transparent rounded-none border-0 h-auto p-0">
            <TabsTrigger 
              value="followers" 
              data-testid="tab-followers"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-semibold text-sm"
            >
              <Users className="h-4 w-4 mr-2" />
              {followerCount} Followers
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              data-testid="tab-following"
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-semibold text-sm"
            >
              <Heart className="h-4 w-4 mr-2" />
              {followingCount} Following
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <>
              {/* Followers Tab */}
              <TabsContent value="followers" className="mt-0 p-0">
                {followers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 py-24 text-center">
                    <div className="bg-muted/40 rounded-full p-4 mb-4 border border-border/50">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No followers yet</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">Start creating amazing content and building your community on AfroSphere</p>
                    <div className="text-xs text-muted-foreground bg-card/50 border border-border/50 rounded-lg p-3 w-full flex items-center justify-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Share posts, engage with creators, and grow your audience</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5 divide-y divide-border/30">
                    {followers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => onUserClick?.(user.username)}
                        className="w-full flex items-center gap-3 p-4 hover-elevate transition-all text-left"
                        data-testid={`follower-${user.username}`}
                      >
                        <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                          <AvatarFallback className="font-bold">{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">@{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.displayName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Following Tab */}
              <TabsContent value="following" className="mt-0 p-0">
                {following.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 py-24 text-center">
                    <div className="bg-muted/40 rounded-full p-4 mb-4 border border-border/50">
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Not following anyone yet</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">Discover and follow creators to see their amazing content on your feed</p>
                    <div className="text-xs text-muted-foreground bg-card/50 border border-border/50 rounded-lg p-3 w-full flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Explore trending creators and artists in the Explore tab</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5 divide-y divide-border/30">
                    {following.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-4 justify-between"
                        data-testid={`following-${user.username}`}
                      >
                        <button
                          onClick={() => onUserClick?.(user.username)}
                          className="flex-1 flex items-center gap-3 hover-elevate transition-all text-left"
                        >
                          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                            <AvatarFallback className="font-bold">{user.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">@{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.displayName}</p>
                          </div>
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnfollow(user.username);
                          }}
                          className="shrink-0"
                          data-testid={`button-unfollow-${user.username}`}
                        >
                          Unfollow
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}
