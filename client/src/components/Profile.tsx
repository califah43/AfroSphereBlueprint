import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import CreatorBadge from "./CreatorBadge";
import bannerImage from "@assets/generated_images/Sunset_gradient_profile_banner_7206e8a3.png";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

interface ProfileProps {
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onSettings?: () => void;
  onPostClick?: (postId: string) => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const mockPosts = [
  { id: "1", image: fashionImage },
  { id: "2", image: artImage },
  { id: "3", image: musicImage },
  { id: "4", image: fashionImage },
  { id: "5", image: artImage },
  { id: "6", image: musicImage },
];

export default function Profile({ isOwnProfile = true, onEditProfile, onSettings, onPostClick, onFollowersClick, onFollowingClick }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="pb-20" data-testid="container-profile">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold">adikeafrica</h2>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden">
          {bannerImage ? (
            <img
              src={bannerImage}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 via-pink-500/80 to-purple-600/80" />
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="-mt-12 mb-4">
          <Avatar className="w-24 h-24 ring-4 ring-background" data-testid="avatar-profile">
            <AvatarFallback className="text-2xl">AC</AvatarFallback>
          </Avatar>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold" data-testid="text-profile-username">
              adikeafrica
            </h1>
          </div>
          <div className="mb-3">
            <CreatorBadge type="fashion-vanguard" size="sm" />
          </div>
          <p className="text-sm text-muted-foreground mb-3" data-testid="text-profile-bio">
            Fashion designer & cultural storyteller 🌍✨ Celebrating African creativity through modern design
          </p>

          <div className="flex gap-6 mb-4">
            <button
              onClick={onFollowersClick}
              className="text-center hover-elevate px-2 py-1 rounded"
              data-testid="button-view-followers"
            >
              <p className="font-bold" data-testid="text-followers-count">1.2K</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </button>
            <button
              onClick={onFollowingClick}
              className="text-center hover-elevate px-2 py-1 rounded"
              data-testid="button-view-following"
            >
              <p className="font-bold" data-testid="text-following-count">485</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </button>
            <div className="text-center px-2 py-1">
              <p className="font-bold" data-testid="text-posts-count">127</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
          </div>

          {isOwnProfile ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={onEditProfile}
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" data-testid="button-follow">
                Follow
              </Button>
              <Button variant="outline" className="flex-1" data-testid="button-message">
                Message
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
            <TabsTrigger value="liked" data-testid="tab-liked">Liked</TabsTrigger>
            <TabsTrigger value="saved" data-testid="tab-saved">Saved</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-3 gap-1 mt-4">
          {mockPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => onPostClick?.(post.id)}
              className="aspect-square hover-elevate overflow-hidden rounded"
              data-testid={`post-grid-${post.id}`}
            >
              <img
                src={post.image}
                alt="Post"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}