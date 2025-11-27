import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Heart, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface User {
  username: string;
  name: string;
  avatar?: string;
  isFollowing?: boolean;
}

interface FollowersListProps {
  username: string;
  followerCount: string;
  followingCount: string;
  onClose: () => void;
}

export default function FollowersList({
  username,
  followerCount,
  followingCount,
  onClose,
}: FollowersListProps) {
  const [activeTab, setActiveTab] = useState("followers");
  const { toast } = useToast();

  const followers: User[] = [];
  const following: User[] = [];

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
          {/* Followers Tab */}
          <TabsContent value="followers" className="mt-0 p-0">
            {followers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 py-24 text-center">
                <div className="bg-muted/40 rounded-full p-4 mb-4 border border-border/50">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No followers yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">Start creating amazing content and building your community on AfroSphere</p>
                <div className="text-xs text-muted-foreground bg-card/50 border border-border/50 rounded-lg p-3 w-full">
                  💡 <span className="ml-1">Share posts, engage with creators, and grow your audience</span>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 divide-y divide-border/30">
                {followers.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center gap-3 p-4 hover-elevate transition-all"
                    data-testid={`follower-${user.username}`}
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarFallback className="font-bold">{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.name}</p>
                    </div>
                  </div>
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
                <div className="text-xs text-muted-foreground bg-card/50 border border-border/50 rounded-lg p-3 w-full">
                  ✨ <span className="ml-1">Explore trending creators and artists in the Explore tab</span>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 divide-y divide-border/30">
                {following.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center gap-3 p-4 hover-elevate transition-all"
                    data-testid={`following-${user.username}`}
                  >
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarFallback className="font-bold">{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
