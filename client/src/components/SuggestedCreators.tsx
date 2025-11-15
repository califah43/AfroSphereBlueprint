import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    username: "yara_designs",
    name: "Yara Design Studio",
    bio: "Contemporary African fashion with a modern twist",
    followers: "8.5K",
    badge: "fashion-vanguard",
  },
  {
    username: "malik_sounds",
    name: "Malik Beats",
    bio: "Afrobeats producer & sound engineer",
    followers: "12.3K",
    badge: "music-star",
  },
  {
    username: "ada_art",
    name: "Ada Contemporary",
    bio: "Visual artist exploring African heritage",
    followers: "6.2K",
    badge: "top-artist",
  },
];

export default function SuggestedCreators() {
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

  const toggleFollow = (username: string) => {
    setFollowStates((prev) => ({ ...prev, [username]: !prev[username] }));
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
            <Avatar className="w-12 h-12">
              <AvatarFallback>{creator.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm">{creator.username}</p>
                {creator.badge && <CreatorBadge type={creator.badge} size="sm" />}
              </div>
              <p className="text-xs text-muted-foreground mb-1">{creator.bio}</p>
              <p className="text-xs text-muted-foreground">{creator.followers} followers</p>
            </div>
            <Button
              size="sm"
              variant={followStates[creator.username] ? "outline" : "default"}
              onClick={() => toggleFollow(creator.username)}
              data-testid={`button-follow-suggested-${creator.username}`}
            >
              {followStates[creator.username] ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
