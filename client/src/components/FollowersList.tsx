import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

const mockFollowers: User[] = [
  { username: "zara_style", name: "Zara Fashion", isFollowing: true },
  { username: "kwame_creative", name: "Kwame Art", isFollowing: false },
  { username: "amara_music", name: "Amara Beats", isFollowing: true },
  { username: "kofi_designs", name: "Kofi Design", isFollowing: false },
  { username: "nia_culture", name: "Nia Culture", isFollowing: true },
];

const mockFollowing: User[] = [
  { username: "adebayo_art", name: "Adebayo Artist", isFollowing: true },
  { username: "yara_fashion", name: "Yara Style", isFollowing: true },
  { username: "malik_beats", name: "Malik Music", isFollowing: true },
];

export default function FollowersList({
  username,
  followerCount,
  followingCount,
  onClose,
}: FollowersListProps) {
  const [activeTab, setActiveTab] = useState("followers");
  const [followStates, setFollowStates] = useState<Record<string, boolean>>(
    Object.fromEntries(
      [...mockFollowers, ...mockFollowing].map((u) => [u.username, u.isFollowing || false])
    )
  );

  const toggleFollow = (user: string) => {
    setFollowStates((prev) => ({ ...prev, [user]: !prev[user] }));
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center">
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-followers">
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold ml-2" data-testid="text-followers-title">
          {username}
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="sticky top-14 bg-background border-b border-border px-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="followers" data-testid="tab-followers">
              {followerCount} Followers
            </TabsTrigger>
            <TabsTrigger value="following" data-testid="tab-following">
              {followingCount} Following
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="followers" className="mt-0 p-4">
            <div className="space-y-2">
              {mockFollowers.map((user) => (
                <div
                  key={user.username}
                  className="flex items-start gap-3 p-2 hover-elevate rounded-lg"
                  data-testid={`follower-${user.username}`}
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={followStates[user.username] ? "outline" : "default"}
                    onClick={() => toggleFollow(user.username)}
                    className="mt-1 flex-shrink-0"
                    data-testid={`button-follow-${user.username}`}
                  >
                    {followStates[user.username] ? "Following" : "Follow"}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-0 p-4">
            <div className="space-y-2">
              {mockFollowing.map((user) => (
                <div
                  key={user.username}
                  className="flex items-center gap-3 p-2 hover-elevate rounded-lg"
                  data-testid={`following-${user.username}`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFollow(user.username)}
                    data-testid={`button-unfollow-${user.username}`}
                  >
                    Following
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}