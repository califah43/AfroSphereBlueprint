import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Heart, Share2, MessageCircle } from "lucide-react";
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
      {/* Elegant Header with Banner */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-pink-500">
          {bannerImage && (
            <img
              src={bannerImage}
              alt="Profile banner"
              className="w-full h-full object-cover opacity-90"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        
        {/* Settings Button */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full"
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Profile Content - Elegant Layout */}
      <div className="max-w-md mx-auto px-4 -mt-20 relative z-10">
        {/* Avatar & Name Section */}
        <div className="mb-6">
          <div className="flex items-end gap-4 mb-4">
            <Avatar className="w-28 h-28 ring-4 ring-background border-4 border-primary/20 shadow-lg" data-testid="avatar-profile">
              <AvatarFallback className="text-3xl font-bold">AC</AvatarFallback>
            </Avatar>
            
            <div className="mb-2">
              <CreatorBadge type="fashion-vanguard" size="sm" />
            </div>
          </div>

          {/* Name & Bio */}
          <h1 className="text-3xl font-bold mb-1" data-testid="text-profile-displayname">
            Adike Wilson
          </h1>
          <p className="text-base text-primary font-semibold mb-3" data-testid="text-profile-username">
            @adikeafrica
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4" data-testid="text-profile-bio">
            Fashion designer & cultural storyteller 🌍✨ Celebrating African creativity through modern design
          </p>

          {/* Stats - Elegant Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6 bg-muted/40 rounded-lg p-4 border border-border">
            <button
              onClick={onFollowersClick}
              className="text-center hover-elevate transition-all group"
              data-testid="button-view-followers"
            >
              <p className="text-2xl font-bold text-primary group-hover:text-primary/80" data-testid="text-followers-count">
                1.2K
              </p>
              <p className="text-xs text-muted-foreground mt-1">Followers</p>
            </button>
            
            <div className="border-l border-r border-border" />
            
            <button
              onClick={onFollowingClick}
              className="text-center hover-elevate transition-all group"
              data-testid="button-view-following"
            >
              <p className="text-2xl font-bold text-primary group-hover:text-primary/80" data-testid="text-following-count">
                485
              </p>
              <p className="text-xs text-muted-foreground mt-1">Following</p>
            </button>

            <div className="border-l border-border" />
            
            <div className="text-center">
              <p className="text-2xl font-bold text-primary" data-testid="text-posts-count">
                127
              </p>
              <p className="text-xs text-muted-foreground mt-1">Posts</p>
            </div>
          </div>

          {/* Action Buttons - Elegant */}
          {isOwnProfile ? (
            <Button
              className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-semibold h-11 rounded-lg"
              onClick={onEditProfile}
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg" 
                data-testid="button-follow"
              >
                Follow
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 rounded-lg" 
                data-testid="button-message"
              >
                Message
              </Button>
            </div>
          )}
        </div>

        {/* Posts Tabs - Minimal & Elegant */}
        <div className="mt-8 border-t border-border pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-border rounded-none p-0 h-auto">
              <TabsTrigger 
                value="posts" 
                data-testid="tab-posts"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-semibold text-sm"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="liked" 
                data-testid="tab-liked"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-semibold text-sm"
              >
                Liked
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                data-testid="tab-saved"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-semibold text-sm"
              >
                Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Post Grid - Sophisticated */}
          <div className="mt-6">
            {activeTab === "posts" && (
              <div className="grid grid-cols-3 gap-2">
                {mockPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => onPostClick?.(post.id)}
                    className="aspect-square hover-elevate overflow-hidden rounded-lg group transition-all duration-300 ring-1 ring-border/50"
                    data-testid={`post-grid-${post.id}`}
                  >
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {activeTab === "liked" && (
              <div className="py-16 text-center">
                <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No liked posts yet</p>
                <p className="text-xs text-muted-foreground mt-1">Posts you like will appear here</p>
              </div>
            )}
            
            {activeTab === "saved" && (
              <div className="py-16 text-center">
                <Share2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No saved posts yet</p>
                <p className="text-xs text-muted-foreground mt-1">Save posts to view them later</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
