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
            followers: userData.followerCount?.toString() || "0",
            following: userData.followingCount?.toString() || "0",
            posts: userData.postCount?.toString() || "0",
            avatar: userData.avatar || "",
            banner: userData.banner || "",
          };
        } catch (e) {
          console.log("Error parsing user data");
          // Return user data instead of falling back to mock
          return {
            displayName: "Your Profile",
            username: "user",
            bio: "Creative on AfroSphere",
            followers: "0",
            following: "0",
            posts: "0",
            avatar: "",
            banner: "",
          };
        }
      }
      // Return user data instead of falling back to mock
      return {
        displayName: "Your Profile",
        username: "user",
        bio: "Creative on AfroSphere",
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
        <div className="flex items-center gap-3 flex-1">
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
          <h2 className="text-lg font-semibold">@{userProfile.username}</h2>
        </div>
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

      {/* Elegant Header with Banner - Compact */}
      <div className="relative h-32 overflow-hidden">
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

      {/* Profile Content - Elegant Layout */}
      <div className="max-w-md mx-auto px-4 -mt-14 relative z-10">
        {/* Avatar & Name Section */}
        <div className="mb-4">
          <div className="flex items-end gap-3 mb-3">
            <button
              onClick={() => userProfile.avatar && setShowPictureModal(true)}
              className={`relative flex-shrink-0 ${userProfile.avatar ? 'hover-elevate cursor-pointer' : ''}`}
              data-testid="button-view-avatar"
            >
              <div className="w-20 h-20 rounded-full ring-4 ring-background border-3 border-primary/20 shadow-lg overflow-hidden bg-muted flex-shrink-0">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-orange-500/20">
                    <span className="text-2xl font-bold text-foreground">{userProfile.username[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
              {userProfile.avatar && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-full transition-colors duration-200 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold opacity-0 hover:opacity-100">View</span>
                </div>
              )}
            </button>
            
            <div className="mb-2">
              <CreatorBadge type="fashion-vanguard" size="sm" />
            </div>
          </div>

          {/* Name & Bio */}
          <h1 className="text-3xl font-black mb-1" data-testid="text-profile-displayname">
            {userProfile.displayName}
          </h1>
          <p className="text-sm text-foreground leading-relaxed mb-3" data-testid="text-profile-bio">
            {userProfile.bio}
          </p>

          {/* Professional Info */}
          <div className="flex flex-col gap-2 mb-4 text-sm">
            {userProfile.location && (
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{userProfile.location}</span>
              </div>
            )}
            {userProfile.profession && (
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{userProfile.profession}</span>
              </div>
            )}
            {userProfile.website && (
              <a href={`https://${userProfile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <Link className="h-4 w-4" />
                <span className="truncate">{userProfile.website}</span>
              </a>
            )}
          </div>

          {/* Stats - Premium Grid */}
          <div className="grid grid-cols-3 gap-3 mb-5 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/10">
            <button
              onClick={onFollowersClick}
              className="flex flex-col items-center gap-1.5 hover-elevate transition-all group py-1"
              data-testid="button-view-followers"
            >
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100" />
                <p className="text-base font-bold text-foreground" data-testid="text-followers-count">
                  {userProfile.followers}
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Followers</p>
            </button>
            
            <div className="w-px bg-border/30" />
            
            <button
              onClick={onFollowingClick}
              className="flex flex-col items-center gap-1.5 hover-elevate transition-all group py-1"
              data-testid="button-view-following"
            >
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100" />
                <p className="text-base font-bold text-foreground" data-testid="text-following-count">
                  {userProfile.following}
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Following</p>
            </button>

            <div className="w-px bg-border/30" />
            
            <button
              onClick={() => onPostClick?.("1")}
              className="flex flex-col items-center gap-1.5 hover-elevate transition-all group py-1"
              data-testid="button-view-posts-count"
            >
              <div className="flex items-center gap-1">
                <Grid3X3 className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100" />
                <p className="text-base font-bold text-foreground" data-testid="text-posts-count">
                  {userProfile.posts}
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Posts</p>
            </button>
          </div>

          {/* Action Buttons - Premium */}
          <div className="flex gap-2 mb-6">
            {isOwnProfile ? (
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold h-10 rounded-lg text-sm shadow-lg shadow-primary/20"
                onClick={onEditProfile}
                data-testid="button-edit-profile"
              >
                Edit Profile
              </Button>
            ) : (
              <Button 
                className={`flex-1 font-bold h-10 rounded-lg text-sm shadow-lg ${isFollowing ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-secondary/20' : 'bg-gradient-to-r from-primary to-orange-500 text-white hover:from-primary/90 hover:to-orange-500/90 shadow-primary/20'}`}
                onClick={toggleFollow}
                disabled={isLoading}
                data-testid="button-follow"
              >
                {isLoading ? "..." : (isFollowing ? "Following" : "Follow")}
              </Button>
            )}
          </div>
        </div>

        {/* Posts Tabs - Premium & Smooth */}
        <div className="mt-6 border-t border-border pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 bg-transparent border-b-2 border-border rounded-none p-0 h-auto gap-0">
              <TabsTrigger 
                value="posts" 
                data-testid="tab-posts"
                className="border-b-3 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-bold text-sm data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="liked" 
                data-testid="tab-liked"
                className="border-b-3 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-bold text-sm data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                <Heart className="h-4 w-4 mr-2" />
                Liked
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                data-testid="tab-saved"
                className="border-b-3 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-3 font-bold text-sm data-[state=active]:text-primary hover:text-primary transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Post Grid - Sophisticated */}
          <div className="mt-6">
            {activeTab === "posts" && (
              <>
                {isOwnProfile && userProfile.posts === "0" ? (
                  <div className="py-16 text-center">
                    <Share2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No posts yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Share your first post to get started</p>
                  </div>
                ) : (
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
