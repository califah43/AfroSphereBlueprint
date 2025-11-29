import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Heart, Share2, X, MapPin, Briefcase, Link, Users, Grid3X3, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import CreatorBadge from "./CreatorBadge";
import BadgeDisplay from "./BadgeDisplay";
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

export default function Profile({ isOwnProfile = true, username, onClose, onEditProfile, onSettings, onPostClick, onFollowersClick, onFollowingClick }: ProfileProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isAccountPrivate, setIsAccountPrivate] = useState(false);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch user data and posts from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let currentUserId: string = "";
        if (isOwnProfile) {
          const storedData = localStorage.getItem("currentUserData");
          if (storedData) {
            const userData = JSON.parse(storedData);
            currentUserId = userData.id || "";
            setUserId(currentUserId);
            setIsAccountPrivate(userData.isPrivate || false);
            setUserProfile({
              displayName: userData.displayName || userData.username || "Your Profile",
              username: userData.username || "user",
              bio: userData.bio || "Creative on AfroSphere",
              location: userData.location || "",
              website: userData.website || "",
              profession: userData.profession || "",
              followers: userData.followerCount?.toString() || "0",
              following: userData.followingCount?.toString() || "0",
              posts: userData.postCount?.toString() || "0",
              avatar: userData.avatar || "",
              banner: userData.banner || "",
            });
          }
        } else if (username) {
          // Fetch from backend by username
          const res = await fetch(`/api/users/username/${username}`);
          if (res.ok) {
            const userData = await res.json();
            currentUserId = userData.id || "";
            setUserId(currentUserId);
            setIsAccountPrivate(userData.isPrivate || false);
            setUserProfile({
              displayName: userData.displayName || userData.username || "Creator",
              username: userData.username || username,
              bio: userData.bio || "Creative on AfroSphere",
              location: userData.location || "",
              website: userData.website || "",
              profession: userData.profession || "",
              followers: userData.followerCount?.toString() || "0",
              following: userData.followingCount?.toString() || "0",
              posts: userData.postCount?.toString() || "0",
              avatar: userData.avatar || "",
              banner: userData.banner || "",
            });
          }
        }

        // Fetch user's posts and badges in parallel
        if (currentUserId) {
          setPostsLoading(true);
          
          // Load cached badges immediately from localStorage
          const cachedBadgesKey = `badges_${currentUserId}`;
          const cachedBadges = localStorage.getItem(cachedBadgesKey);
          if (cachedBadges) {
            try {
              setUserBadges(JSON.parse(cachedBadges));
            } catch (e) {
              // Invalid cache, ignore
            }
          }
          
          const [postsRes, badgesRes] = await Promise.all([
            fetch(`/api/posts/user/${currentUserId}`),
            fetch(`/api/badges/user/${currentUserId}`)
          ]);
          
          if (postsRes.ok) {
            const posts = await postsRes.json();
            setUserPosts(posts || []);
          }
          
          if (badgesRes.ok) {
            const badges = await badgesRes.json();
            const badgesArray = Array.isArray(badges) ? badges : [];
            setUserBadges(badgesArray);
            // Cache badges for instant load next time
            localStorage.setItem(cachedBadgesKey, JSON.stringify(badgesArray));
          }
          
          setPostsLoading(false);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
        setPostsLoading(false);
      }
    };

    fetchUserData();
  }, [username, isOwnProfile]);

  // Listen for post refresh events to refetch user's posts
  useEffect(() => {
    const handleRefresh = async () => {
      try {
        let userId: string = "";
        if (isOwnProfile) {
          const storedData = localStorage.getItem("currentUserData");
          if (storedData) {
            const userData = JSON.parse(storedData);
            userId = userData.id || "";
            setIsAccountPrivate(userData.isPrivate || false);
          }
        } else if (username) {
          const res = await fetch(`/api/users/username/${username}`);
          if (res.ok) {
            const userData = await res.json();
            userId = userData.id || "";
            setIsAccountPrivate(userData.isPrivate || false);
          }
        }

        if (userId) {
          const postsRes = await fetch(`/api/posts/user/${userId}`);
          if (postsRes.ok) {
            const posts = await postsRes.json();
            setUserPosts(posts || []);
          }
        }
      } catch (error) {
        console.log("Error refreshing user posts:", error);
      }
    };

    const handlePrivacyChange = () => {
      if (isOwnProfile) {
        const storedData = localStorage.getItem("currentUserData");
        if (storedData) {
          const userData = JSON.parse(storedData);
          setIsAccountPrivate(userData.isPrivate || false);
        }
      }
    };

    window.addEventListener('refreshPosts', handleRefresh);
    window.addEventListener('userPrivacyChanged', handlePrivacyChange);
    return () => {
      window.removeEventListener('refreshPosts', handleRefresh);
      window.removeEventListener('userPrivacyChanged', handlePrivacyChange);
    };
  }, [username, isOwnProfile]);
  
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
      const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
      const currentUserId = currentUserData?.id;
      const targetUsername = username;
      
      if (!currentUserId || !targetUsername) {
        toast({
          title: "Error",
          description: "Missing user information",
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
        setIsFollowing(data.following);
        toast({
          title: data.following ? "Following" : "Unfollowed",
          description: data.following ? `You're now following @${targetUsername}` : `You unfollowed @${targetUsername}`,
          className: "border-primary/20 bg-card",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${isFollowing ? 'unfollow' : 'follow'}`,
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
      {/* Sticky Header - Only show for other profiles */}
      {!isOwnProfile && (
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between z-20">
          {onClose && (
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
        </div>
      )}

      {/* Elegant Banner - Extends to Top */}
      <div className="relative h-32 overflow-hidden -mt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-pink-500">
          {userProfile?.banner ? (
            <img
              src={userProfile.banner}
              alt="Profile banner"
              className="w-full h-full object-cover opacity-85"
            />
          ) : (
            <img
              src={bannerImage}
              alt="Profile banner"
              className="w-full h-full object-cover opacity-85"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Profile Content - Compact & Refined for Mobile */}
      <div className="max-w-md mx-auto px-4 relative z-10 pb-6">
        {/* Header for Own Profile (Settings) */}
        {isOwnProfile && (
          <div className="flex items-center justify-between mb-4 -mt-14">
            <div className="flex-1 flex items-center gap-2">
              {isAccountPrivate && (
                <Lock className="h-4 w-4 text-muted-foreground" data-testid="icon-private-indicator" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              data-testid="button-settings"
              className="hover-elevate"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Avatar - Overlaps Banner */}
        <div className="flex mb-4 -mt-14">
          <button
            onClick={() => userProfile?.avatar && setShowPictureModal(true)}
            className={`relative ${userProfile?.avatar ? 'hover-elevate cursor-pointer' : ''}`}
            data-testid="button-view-avatar"
          >
            <div className="w-16 h-16 rounded-full ring-3 ring-background overflow-hidden bg-muted shadow-sm">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-orange-500/20">
                  <span className="text-lg font-black text-foreground">{userProfile?.username?.[0]?.toUpperCase() || "U"}</span>
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Name & Username - Left Aligned */}
        <div className="mb-4">
          {/* Display Name with Badges */}
          <div className="flex items-center gap-1 mb-1">
            <h1 className="text-lg font-black tracking-tight" data-testid="text-profile-displayname">
              {userProfile?.displayName || "Loading..."}
            </h1>
            {userBadges && userBadges.length > 0 && (
              <div className="flex items-center gap-1">
                {userBadges.map((badge: any) => (
                  <div key={badge.id} className="w-4 h-4 inline-block" title={badge.name}>
                    <img 
                      src={`data:image/svg+xml;base64,${btoa(badge.iconSvg)}`} 
                      alt={badge.name}
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Unique Username Handle */}
          <p className="text-xs text-muted-foreground font-medium mb-2" data-testid="text-profile-username">@{userProfile?.username || "user"}</p>

          {/* Bio - Compact elegance */}
          <p className="text-xs text-foreground leading-tight mb-2" data-testid="text-profile-bio">
            {userProfile?.bio || "Creative on AfroSphere"}
          </p>

          {/* Creator Badge */}
          <div className="flex items-center">
            <CreatorBadge type="fashion-vanguard" size="sm" />
          </div>
        </div>

        {/* Professional Info - Compact & Refined */}
        {userProfile && (userProfile.profession || userProfile.location || userProfile.website) && (
          <div className="flex flex-col gap-1 mb-4 text-xs">
            {userProfile.profession && (
              <div className="flex items-center gap-2 text-foreground">
                <Briefcase className="h-3 w-3 text-primary/60 flex-shrink-0" />
                <span className="font-medium truncate">{userProfile.profession}</span>
              </div>
            )}
            {userProfile.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary/60 flex-shrink-0" />
                <span className="truncate">{userProfile.location}</span>
              </div>
            )}
            {userProfile.website && (
              <a href={`https://${userProfile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors truncate">
                <Link className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{userProfile.website}</span>
              </a>
            )}
          </div>
        )}

        {/* Stats - Elegant Compact Cards */}
        {userProfile && (
        <div className="grid grid-cols-2 gap-2 mb-4 p-2 bg-card rounded-md border border-border/50">
          <button
            onClick={onFollowersClick}
            className="text-center py-1.5 hover-elevate transition-all rounded"
            data-testid="button-view-followers"
          >
            <p className="text-lg font-black text-foreground" data-testid="text-followers-count">{userProfile.followers}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-0.5">Followers</p>
          </button>
          <button
            onClick={onFollowingClick}
            className="text-center py-1.5 hover-elevate transition-all rounded border-l border-border/50"
            data-testid="button-view-following"
          >
            <p className="text-lg font-black text-foreground" data-testid="text-following-count">{userProfile.following}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-0.5">Following</p>
          </button>
        </div>
        )}

        {/* Action Buttons - Refined */}
        {userProfile && (
        <div className="flex gap-2 mb-6">
          {isOwnProfile ? (
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold rounded-lg text-xs h-9 shadow-sm"
              onClick={onEditProfile}
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
          ) : (
            <Button 
              className={`flex-1 font-bold rounded-lg text-xs h-9 shadow-sm ${isFollowing ? 'bg-card border border-border text-foreground hover:bg-card/80' : 'bg-gradient-to-r from-primary to-orange-500 text-white hover:from-primary/90 hover:to-orange-500/90'}`}
              onClick={toggleFollow}
              disabled={isLoading}
              data-testid="button-follow"
            >
              {isLoading ? "..." : (isFollowing ? "Following" : "Follow")}
            </Button>
          )}
        </div>
        )}

        {/* Posts Tabs & Grid - Refined & Modern */}
        {userProfile && (
          <div className="border-t border-border/50">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 bg-transparent rounded-none p-0 h-auto gap-0">
                <TabsTrigger 
                  value="posts" 
                  data-testid="tab-posts"
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-4 font-semibold text-sm uppercase tracking-wider data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors"
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="liked" 
                  data-testid="tab-liked"
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-4 font-semibold text-sm uppercase tracking-wider data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors"
                >
                  Likes
                </TabsTrigger>
                <TabsTrigger 
                  value="saved" 
                  data-testid="tab-saved"
                  className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none py-4 font-semibold text-sm uppercase tracking-wider data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors"
                >
                  Saved
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Post Grid - Beautiful & Spacious */}
            <div className="mt-6">
              {activeTab === "posts" && (
                <>
                  {postsLoading ? (
                    <div className="grid grid-cols-3 gap-1 mt-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square overflow-hidden rounded-md bg-muted animate-pulse"
                        />
                      ))}
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-4">
                        <Share2 className="h-7 w-7 text-primary/40" />
                      </div>
                      <p className="text-foreground font-semibold text-lg">No posts yet</p>
                      <p className="text-sm text-muted-foreground mt-2">Share your first post to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 mt-4">
                      {userPosts.map((post) => {
                        const imageUrl = post.images && post.images.length > 0 ? post.images[0] : (post.imageUrl || post.image);
                        return (
                          <button
                            key={post.id}
                            onClick={() => onPostClick?.(post.id)}
                            className="aspect-square overflow-hidden rounded-md group transition-all duration-300 hover-elevate relative"
                            data-testid={`post-grid-${post.id}`}
                          >
                            <img
                              src={imageUrl}
                              alt="Post"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {post.images && post.images.length > 1 && (
                              <div className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-semibold">
                                {post.images.length}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              
              {activeTab === "liked" && (
                <div className="py-16 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No liked posts yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Posts you like will appear here</p>
                </div>
              )}
              
              {activeTab === "saved" && (
                <div className="py-16 text-center">
                  <Share2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No saved posts yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Save posts to view them later</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showPictureModal && userProfile?.avatar && (
        <ProfilePictureModal
          imageUrl={userProfile.avatar}
          displayName={userProfile.displayName}
          onClose={() => setShowPictureModal(false)}
        />
      )}
    </div>
  );
}
