import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import bannerImage from "@assets/generated_images/Sunset_gradient_profile_banner_7206e8a3.png";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

interface ProfileProps {
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onSettings?: () => void;
}

const mockPosts = [
  { id: "1", image: fashionImage },
  { id: "2", image: artImage },
  { id: "3", image: musicImage },
  { id: "4", image: fashionImage },
  { id: "5", image: artImage },
  { id: "6", image: musicImage },
];

export default function Profile({ isOwnProfile = true, onEditProfile, onSettings }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="pb-20" data-testid="container-profile">
      <div className="relative">
        <img
          src={bannerImage}
          alt="Profile banner"
          className="w-full h-48 object-cover"
          data-testid="img-profile-banner"
        />
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-background/50 backdrop-blur-sm"
            onClick={onSettings}
            data-testid="button-settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="-mt-12 mb-4">
          <Avatar className="w-24 h-24 ring-4 ring-background" data-testid="avatar-profile">
            <AvatarFallback className="text-2xl">AC</AvatarFallback>
          </Avatar>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1" data-testid="text-profile-username">
            adikeafrica
          </h1>
          <p className="text-sm text-muted-foreground mb-3" data-testid="text-profile-bio">
            Fashion designer & cultural storyteller 🌍✨ Celebrating African creativity through modern design
          </p>

          <div className="flex gap-6 mb-4">
            <div className="text-center">
              <p className="font-bold" data-testid="text-followers-count">1.2K</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold" data-testid="text-following-count">485</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
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
