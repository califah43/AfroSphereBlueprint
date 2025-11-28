import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Heart, Share2, X, MapPin, Briefcase, Link, Users, Grid3X3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreatorBadge from "./CreatorBadge";
import ProfilePictureModal from "./ProfilePictureModal";
import bannerImage from "@assets/generated_images/Sunset_gradient_profile_banner_7206e8a3.png";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

interface ProfileProps {
  isOwnProfile?: boolean;
  username?: string;
  onClose?: () => void;
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

const userProfiles: Record<string, any> = {
  adikeafrica: {
    displayName: "Adike Wilson",
    username: "adikeafrica",
    bio: "Fashion designer & cultural storyteller 🌍✨ Celebrating African creativity through modern design",
    followers: "1.2K",
    following: "485",
    posts: "127",
  },
  zara_style: {
    displayName: "Zara Style",
    username: "zara_style",
    bio: "New collection: Bold patterns, sustainable fabrics. Shop local, think global 🌍",
    followers: "8.5K",
    following: "234",
    posts: "89",
  },
  beat_masta: {
    displayName: "Beat Master",
    username: "beat_masta",
    bio: "Producer | Beatmaker | Creating the future of music 🎵",
    followers: "12.3K",
    following: "567",
    posts: "156",
  },
  kojoart: {
    displayName: "Kojo Art",
    username: "kojoart",
    bio: "Contemporary artist exploring African heritage through modern art 🎨",
    followers: "8.9K",
    following: "342",
    posts: "67",
  },
};

export default function Profile({ isOwnProfile = true, username, onClose, onEditProfile, onSettings, onPostClick, onFollowersClick, onFollowingClick }: ProfileProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const { toast } = useToast();
  
  // Get real user data from localStorage if own profile
  const getProfileData = () => {
    if (isOwnProfile) {
      const storedData = localStorage.getItem("currentUserData");
      if (storedData) {
        try {
          const userData = JSON.parse(storedData);
          return {
            displayName: userData.displayName || userData.username || userData.email?.split('@')[0] || "Your Profile",
            username: userData.username || userData.email?.split('@')[0] || "user",
            bio: userData.bio || "Creative on AfroSphere",
            location: userData.location || "",
            website: userData.website || "",
            profession: userData.profession || "",
            followers: userData.followerCount?.toString() || "0",
            following: userData.followingCount?.toString() || "0",
            posts: userData.postCount?.toString() || "0",
            avatar: userData.avatar || "",
            banner: userData.banner || "",
          };
        } catch (e) {
          console.log("Error parsing user data");
          return {
            displayName: "Your Profile",
            username: "user",
            bio: "Creative on AfroSphere",
            location: "",
            website: "",
            profession: "",
            followers: "0",
            following: "0",
            posts: "0",
            avatar: "",
            banner: "",
          };
        }
      }
      return {
        displayName: "Your Profile",
        username: "user",
        bio: "Creative on AfroSphere",
        location: "",
        website: "",
        profession: "",
        followers: "0",
        following: "0",
        posts: "0",
        avatar: "",
        banner: "",
      };
    }
    return userProfiles[username || "user"] || userProfiles.adikeafrica;
  };
  
  const userProfile = getProfileData();

  // Get the username for API calls (use stored for own profile, fallback for others)
  const getApiUsername = () => {
    if (isOwnProfile) {
      const stored = localStorage.getItem("currentUserData");
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          return userData.username || "user";
        } catch (e) {
          return "user";
        }
      }
      return "user";
    }
    return username || "user";
  };

  const toggleFollow = async () => {
    setIsLoading(true);
    try {
      const followUsername = getApiUsername();
      const endpoint = isFollowing ? `/api/follows/unfollow/${followUsername}` : `/api/follows/${followUsername}`;
      const method = isFollowing ? 'DELETE' : 'POST';
      
      const res = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        setIsFollowing(!isFollowing);
        toast({
          title: isFollowing ? "Unfollowed" : "Following",
          description: isFollowing ? `You unfollowed @${getApiUsername()}` : `You're now following @${getApiUsername()}`,
          className: "border-primary/20 bg-card",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isFollowing ? 'unfollow' : 'follow'} @${getApiUsername()}`,
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
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20" data-testid="container-profile">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between z-20">
        {!isOwnProfile && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover-elevate"
            data-testid="button-close-profile"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1" />
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            data-testid="button-settings"
            className="hover-elevate"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Compact Banner */}
      <div className="relative h-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-pink-500">
          {(userProfile.banner || bannerImage) && (
            <img
              src={userProfile.banner || bannerImage}
              alt="Profile banner"
              className="w-full h-full object-cover opacity-90"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
      </div>

      {/* Profile Content - Ultra Compact */}
      <div className="max-w-md mx-auto px-4 -mt-12 relative z-10 pb-4">
        {/* Avatar Section - Centered */}
        <div className="text-center mb-4">
          <button
            onClick={() => userProfile.avatar && setShowPictureModal(true)}
            className={`relative inline-block mb-2 ${userProfile.avatar ? 'hover-elevate cursor-pointer' : ''}`}
            data-testid="button-view-avatar"
          >
            <div className="w-16 h-16 rounded-full ring-3 ring-background overflow-hidden bg-muted">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-orange-500/20">
                  <span className="text-lg font-bold text-foreground">{userProfile.username[0].toUpperCase()}</span>
                </div>
              )}
            </div>
          </button>

          {/* Name, Badge & Username */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-lg font-black" data-testid="text-profile-displayname">
              {userProfile.displayName}
            </h1>
            <CreatorBadge type="fashion-vanguard" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground mb-2" data-testid="text-profile-username">@{userProfile.username}</p>

          {/* Bio */}
          <p className="text-sm text-foreground leading-tight mb-2" data-testid="text-profile-bio">
            {userProfile.bio}
          </p>

          {/* Professional Info - Inline Compact */}
          {(userProfile.profession || userProfile.location) && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
              {userProfile.profession && (
                <span>{userProfile.profession}</span>
              )}
              {userProfile.profession && userProfile.location && (
                <span>·</span>
              )}
              {userProfile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{userProfile.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats - Minimal */}
          <div className="flex gap-6 justify-center mb-4 text-sm">
            <button
              onClick={onFollowersClick}
              className="hover:opacity-70 transition-opacity"
              data-testid="button-view-followers"
            >
              <span className="font-bold text-foreground" data-testid="text-followers-count">{userProfile.followers}</span>
              <span className="text-muted-foreground"> Following</span>
            </button>
            <button
              onClick={onFollowingClick}
              className="hover:opacity-70 transition-opacity"
              data-testid="button-view-following"
            >
              <span className="font-bold text-foreground" data-testid="text-following-count">{userProfile.following}</span>
              <span className="text-muted-foreground"> Followers</span>
            </button>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-2 mb-6">
          {isOwnProfile ? (
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold h-9 rounded-full text-sm"
              onClick={onEditProfile}
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
          ) : (
            <Button 
              className={`flex-1 font-bold h-9 rounded-full text-sm ${isFollowing ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'bg-gradient-to-r from-primary to-orange-500 text-white hover:from-primary/90 hover:to-orange-500/90'}`}
              onClick={toggleFollow}
              disabled={isLoading}
              data-testid="button-follow"
            >
              {isLoading ? "..." : (isFollowing ? "Following" : "Follow")}
            </Button>
          )}
        </div>

        {/* Posts Tabs - Clean & Minimal */}
        <div className="mt-8 border-t border-border/50 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 bg-transparent border-b border-border/50 rounded-none p-0 h-auto gap-0">
              <TabsTrigger 
                value="posts" 
                data-testid="tab-posts"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-semibold text-xs uppercase tracking-wider data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="liked" 
                data-testid="tab-liked"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-semibold text-xs uppercase tracking-wider data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
              >
                Likes
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                data-testid="tab-saved"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-semibold text-xs uppercase tracking-wider data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
              >
                Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Post Grid - Elegant */}
          <div className="mt-6">
            {activeTab === "posts" && (
              <>
                {isOwnProfile && userProfile.posts === "0" ? (
                  <div className="py-20 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Share2 className="h-6 w-6 text-primary/50" />
                    </div>
                    <p className="text-foreground font-semibold">No posts yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Share your first post to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 mt-4">
                    {mockPosts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => onPostClick?.(post.id)}
                        className="aspect-square overflow-hidden rounded group transition-all duration-200"
                        data-testid={`post-grid-${post.id}`}
                      >
                        <img
                          src={post.image}
                          alt="Post"
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-200"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
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

      {showPictureModal && userProfile.avatar && (
        <ProfilePictureModal
          imageUrl={userProfile.avatar}
          displayName={userProfile.displayName}
          onClose={() => setShowPictureModal(false)}
        />
      )}
    </div>
  );
}
