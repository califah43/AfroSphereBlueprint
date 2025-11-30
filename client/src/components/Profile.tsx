import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Heart, Share2, X, MapPin, Briefcase, Link, Users, Grid3X3, Lock, Loader2, Flag, Ban, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { FontSizes } from "@/lib/fontSizes";
import CreatorBadge from "./CreatorBadge";
import BadgeDisplay from "./BadgeDisplay";
import ProfilePictureModal from "./ProfilePictureModal";
import ProfilePicture from "./ProfilePicture";
import ImageViewer from "./ImageViewer";
import HeaderCropper from "./HeaderCropper";
import { useProfilePictureUpload } from "@/hooks/useProfilePictureUpload";
import { getCacheBustedUrl } from "@/lib/imageCompression";
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
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowRequestPending, setIsFollowRequestPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showHeaderViewer, setShowHeaderViewer] = useState(false);
  const [showHeaderCropper, setShowHeaderCropper] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isAccountPrivate, setIsAccountPrivate] = useState(false);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfilePicture, isUploading } = useProfilePictureUpload();
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
              profileImageUrl: userData.profileImageUrl || "",
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
              profileImageUrl: userData.profileImageUrl || "",
              banner: userData.banner || "",
            });
          }
        }

        // Fetch user's posts and badges in parallel
        if (currentUserId) {
          setPostsLoading(true);
          
          // Load cached data immediately from localStorage
          const cachedBadgesKey = `badges_${currentUserId}`;
          const cachedPostsKey = `posts_${currentUserId}`;
          const cachedLikedKey = `liked_${currentUserId}`;
          
          const cachedBadges = localStorage.getItem(cachedBadgesKey);
          const cachedPosts = localStorage.getItem(cachedPostsKey);
          const cachedLiked = localStorage.getItem(cachedLikedKey);
          
          if (cachedBadges) {
            try {
              setUserBadges(JSON.parse(cachedBadges));
            } catch (e) {
              // Invalid cache, ignore
            }
          }
          
          if (cachedPosts) {
            try {
              setUserPosts(JSON.parse(cachedPosts));
            } catch (e) {
              // Invalid cache, ignore
            }
          }
          
          if (cachedLiked) {
            try {
              setLikedPosts(JSON.parse(cachedLiked));
            } catch (e) {
              // Invalid cache, ignore
            }
          }
          
          // Check if current user is following this user (only for other profiles)
          if (!isOwnProfile) {
            try {
              const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
              if (currentUserData?.id) {
                const checkRes = await fetch(`/api/follows/check?followerId=${currentUserData.id}&followingId=${currentUserId}`);
                if (checkRes.ok) {
                  const data = await checkRes.json();
                  setIsFollowing(data.isFollowing === true);
                }
              }
            } catch (e) {
              console.log("Error checking follow status:", e);
            }
          }
          
          const [postsRes, badgesRes, likedRes] = await Promise.all([
            fetch(`/api/posts/user/${currentUserId}`),
            fetch(`/api/badges/user/${currentUserId}`),
            fetch(`/api/posts/user/${currentUserId}/liked`)
          ]);
          
          if (postsRes.ok) {
            const posts = await postsRes.json();
            setUserPosts(posts || []);
            localStorage.setItem(cachedPostsKey, JSON.stringify(posts || []));
          }
          
          if (likedRes.ok) {
            const liked = await likedRes.json();
            setLikedPosts(liked || []);
            localStorage.setItem(cachedLikedKey, JSON.stringify(liked || []));
          }
          
          if (badgesRes.ok) {
            const badges = await badgesRes.json();
            const badgesArray = Array.isArray(badges) ? badges : [];
            setUserBadges(badgesArray);
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

  // Listen for following count updates from FollowersList
  useEffect(() => {
    const handleFollowingCountUpdate = (event: any) => {
      if (isOwnProfile) {
        setUserProfile((prev: any) => ({
          ...prev,
          following: event.detail.followingCount.toString(),
        }));
      }
    };

    window.addEventListener('followingCountUpdated', handleFollowingCountUpdate);
    return () => window.removeEventListener('followingCountUpdated', handleFollowingCountUpdate);
  }, [isOwnProfile]);

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
          // Load cached data immediately
          const cachedPostsKey = `posts_${userId}`;
          const cachedLikedKey = `liked_${userId}`;
          
          const cachedPosts = localStorage.getItem(cachedPostsKey);
          const cachedLiked = localStorage.getItem(cachedLikedKey);
          
          if (cachedPosts) {
            try {
              setUserPosts(JSON.parse(cachedPosts));
            } catch (e) {
              // Invalid cache, ignore
            }
          }
          
          if (cachedLiked) {
            try {
              setLikedPosts(JSON.parse(cachedLiked));
            } catch (e) {
              // Invalid cache, ignore
            }
          }
          
          const [postsRes, likedRes] = await Promise.all([
            fetch(`/api/posts/user/${userId}`),
            fetch(`/api/posts/user/${userId}/liked`)
          ]);
          if (postsRes.ok) {
            const posts = await postsRes.json();
            setUserPosts(posts || []);
            localStorage.setItem(cachedPostsKey, JSON.stringify(posts || []));
          }
          if (likedRes.ok) {
            const liked = await likedRes.json();
            setLikedPosts(liked || []);
            localStorage.setItem(cachedLikedKey, JSON.stringify(liked || []));
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
          title: t("common.error"),
          description: t("profile.missingUserInfo"),
          variant: "destructive",
        });
        return;
      }
      
      // Fetch target user by username to get their ID
      const userRes = await fetch(`/api/users/username/${targetUsername}`);
      if (!userRes.ok) {
        toast({
          title: t("common.error"),
          description: t("profile.userNotFound"),
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
        
        // Handle follow request for private accounts
        if (data.followRequest) {
          setIsFollowRequestPending(true);
          toast({
            title: t("profile.followRequestSent"),
            description: `Follow request sent to @${targetUsername}`,
            className: "border-primary/20 bg-card",
          });
        } else if (data.following) {
          setIsFollowing(true);
          setUserProfile((prev: any) => ({
            ...prev,
            followers: (parseInt(prev.followers || "0") + 1).toString(),
          }));
          const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
          if (currentUserData && currentUserData.id) {
            currentUserData.followingCount = (currentUserData.followingCount || 0) + 1;
            localStorage.setItem("currentUserData", JSON.stringify(currentUserData));
          }
          toast({
            title: t("profile.following"),
            description: `You're now following @${targetUsername}`,
            className: "border-primary/20 bg-card",
          });
        } else {
          setIsFollowing(false);
          setUserProfile((prev: any) => ({
            ...prev,
            followers: Math.max(0, parseInt(prev.followers || "1") - 1).toString(),
          }));
          const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
          if (currentUserData && currentUserData.id) {
            currentUserData.followingCount = Math.max(0, (currentUserData.followingCount || 1) - 1);
            localStorage.setItem("currentUserData", JSON.stringify(currentUserData));
          }
          toast({
            title: t("profile.unfollowed"),
            description: `You unfollowed @${targetUsername}`,
            className: "border-primary/20 bg-card",
          });
        }
      } else {
        const errorData = await res.json();
        if (errorData.error?.includes("already sent")) {
          setIsFollowRequestPending(true);
        } else {
          toast({
            title: t("common.error"),
            description: t("profile.failedToToggleFollow"),
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast({
        title: t("profile.connectionError"),
        description: t("profile.failedToProcess"),
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

      {/* Banner - Extends to Top */}
      <div 
        className="relative -mt-0 cursor-pointer group"
        style={{ height: '150px', overflow: 'visible' }}
        onClick={() => setShowHeaderViewer(true)}
        data-testid="div-profile-banner"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-pink-500">
          {userProfile?.banner ? (
            <img
              src={userProfile.banner}
              alt="Profile banner"
              className="w-full h-full object-cover opacity-85 group-hover:opacity-75 transition-opacity"
            />
          ) : (
            <img
              src={bannerImage}
              alt="Profile banner"
              className="w-full h-full object-cover opacity-85 group-hover:opacity-75 transition-opacity"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Avatar - Overlaps Banner from Bottom */}
        <div style={{ position: 'absolute', bottom: -40, left: 15, zIndex: 20 }}>
          <ProfilePicture
            src={userProfile?.profileImageUrl || userProfile?.avatar}
            alt="Profile picture"
            size="xl"
            onClick={() => setShowImageViewer(true)}
            editable={isOwnProfile}
            onEditClick={() => fileInputRef.current?.click()}
            className="shadow-sm"
            style={{ border: '4px solid #000' }}
          />
          
          {/* Hidden file input for profile picture upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,base64,image/jpg,image/png"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !userId) return;

              try {
                const newUrl = await uploadProfilePicture(file, userId);
                if (newUrl) {
                  setUserProfile((prev: any) => ({
                    ...prev,
                    profileImageUrl: newUrl,
                  }));
                  
                  const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
                  userData.profileImageUrl = newUrl;
                  localStorage.setItem("currentUserData", JSON.stringify(userData));
                  
                  toast({
                    title: "Success",
                    description: "Profile picture updated!",
                  });
                }
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to upload profile picture",
                  variant: "destructive",
                });
              }
            }}
            data-testid="input-profile-picture-upload"
          />

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Loader2 className="text-white animate-spin" size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Image Viewer */}
      <ImageViewer
        src={userProfile?.profileImageUrl || userProfile?.avatar || ""}
        alt="Profile picture"
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />

      {/* Premium Profile Content */}
      <div className="px-4 pt-0">
        {/* Kente Accent Strip - Premium Design Element */}
        <div className="flex gap-0 -mt-0 mb-4" style={{ height: '4px' }}>
          <div className="flex-1 bg-gradient-to-r from-primary to-orange-400"></div>
          <div className="flex-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
          <div className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600"></div>
        </div>

        {/* Name & Username - Centered Premium Typography */}
        <div className="text-center mb-6 mt-3">
          {/* Display Name with Badges */}
          <div className="flex items-center justify-center gap-1 mb-2">
            <h1 className="font-black tracking-tight text-2xl" data-testid="text-profile-displayname">
              {userProfile?.displayName || "Loading..."}
            </h1>
            {isAccountPrivate && (
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" data-testid="icon-private-indicator" />
            )}
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
          <p className="text-sm text-muted-foreground font-medium mb-3" data-testid="text-profile-username">@{userProfile?.username || "user"}</p>

          {/* Bio - Premium elegance */}
          <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap" data-testid="text-profile-bio">
            {userProfile?.bio || "Creative on AfroSphere"}
          </p>

          {/* Creator Badge */}
          <div className="flex items-center">
            <CreatorBadge type="fashion-vanguard" size="sm" />
          </div>
        </div>

        {/* Professional Info - Centered & Refined */}
        {userProfile && (userProfile.profession || userProfile.location || userProfile.website) && (
          <div className="flex flex-col gap-2 mb-6 text-xs justify-center items-center">
            {userProfile.profession && (
              <div className="flex items-center gap-2 text-foreground">
                <Briefcase className="h-4 w-4 text-primary/60 flex-shrink-0" />
                <span className="font-medium">{userProfile.profession}</span>
              </div>
            )}
            {userProfile.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary/60 flex-shrink-0" />
                <span>{userProfile.location}</span>
              </div>
            )}
            {userProfile.website && (
              <a href={`https://${userProfile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <Link className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs">{userProfile.website}</span>
              </a>
            )}
          </div>
        )}

        {/* Stats - Premium Cards with Enhanced Design */}
        {userProfile && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-gradient-to-r from-card via-primary/5 to-card rounded-md border border-primary/20">
          <button
            onClick={() => onPostClick?.('')}
            className="text-center py-2 hover-elevate transition-all rounded group"
            data-testid="button-view-posts"
          >
            <p className="text-lg font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-orange-500" data-testid="text-posts-count">{userProfile.posts}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-1">Posts</p>
          </button>
          <button
            onClick={onFollowersClick}
            className="text-center py-2 hover-elevate transition-all rounded border-l border-primary/20 group"
            data-testid="button-view-followers"
          >
            <p className="text-lg font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-orange-500" data-testid="text-followers-count">{userProfile.followers}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-1">Followers</p>
          </button>
          <button
            onClick={onFollowingClick}
            className="text-center py-2 hover-elevate transition-all rounded border-l border-primary/20 group"
            data-testid="button-view-following"
          >
            <p className="text-lg font-black bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-orange-500" data-testid="text-following-count">{userProfile.following}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mt-1">Following</p>
          </button>
        </div>
        )}

        {/* Action Buttons - Premium Glass Morphism Style */}
        {userProfile && (
        <div className="flex gap-3 mb-6 justify-center flex-wrap">
          {isOwnProfile ? (
            <Button
              className="bg-gradient-to-r from-primary via-orange-500 to-red-600 hover:from-primary/90 hover:via-orange-500/90 hover:to-red-600/90 text-white font-bold rounded-full px-8 h-10 shadow-lg gold-glow transition-all"
              onClick={onEditProfile}
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                className={`font-bold rounded-full px-8 h-10 shadow-lg transition-all ${isFollowRequestPending ? 'bg-white/10 border border-white/20 text-white backdrop-blur-md' : isFollowing ? 'bg-white/10 border border-white/20 text-white backdrop-blur-md' : 'bg-gradient-to-r from-primary to-orange-500 text-white hover:from-primary/90 hover:to-orange-500/90 gold-glow'}`}
                onClick={toggleFollow}
                disabled={isLoading || isFollowRequestPending}
                data-testid="button-follow"
              >
                {isLoading ? "..." : (isFollowRequestPending ? t("profile.followRequestPending") : isFollowing ? t("profile.unfollow") : (isAccountPrivate ? t("profile.sendFollowRequest") : t("profile.follow")))}
              </Button>
              <Button
                className="bg-white/10 border border-white/20 text-foreground backdrop-blur-md hover:bg-white/20 rounded-full h-10 w-10 transition-all"
                size="icon"
                data-testid="button-report-user"
                title="Report user"
              >
                <Flag size={18} />
              </Button>
              <Button
                className="bg-white/10 border border-white/20 text-foreground backdrop-blur-md hover:bg-white/20 rounded-full h-10 w-10 transition-all"
                size="icon"
                data-testid="button-block-user"
                title="Block user"
              >
                <Ban size={18} />
              </Button>
            </>
          )}
        </div>
        )}

        {/* Private Account Message */}
        {!isOwnProfile && isAccountPrivate && !isFollowing && !isFollowRequestPending && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50 text-center">
            <Lock className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground mb-1">This account is private</p>
            <p className="text-xs text-muted-foreground">Follow to see their posts</p>
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
                      <p className="text-foreground font-semibold text-lg" data-testid="text-no-posts">{t("feed.noPosts")}</p>
                      <p className="text-sm text-muted-foreground mt-2" data-testid="text-share-first">Share your first post to get started</p>
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
                <>
                  {(() => {
                    const filteredLikedPosts = likedPosts.filter(post => post.userId !== userId);
                    return filteredLikedPosts.length === 0 ? (
                      <div className="py-16 text-center">
                        <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">No liked posts yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Posts you like will appear here</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1 mt-4">
                        {filteredLikedPosts.map((post) => {
                          const imageUrl = post.images && post.images.length > 0 ? post.images[0] : (post.imageUrl || post.image);
                          return (
                            <button
                              key={post.id}
                              onClick={() => onPostClick?.(post.id)}
                              className="aspect-square overflow-hidden rounded-md group transition-all duration-300 hover-elevate relative"
                              data-testid={`liked-post-grid-${post.id}`}
                            >
                              <img
                                src={imageUrl}
                                alt="Liked post"
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
                    );
                  })()}
                </>
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
      
      {showHeaderViewer && (
        <ImageViewer
          src={userProfile?.banner || bannerImage}
          alt="Cover photo"
          isOpen={showHeaderViewer}
          onClose={() => setShowHeaderViewer(false)}
        />
      )}

      {showHeaderCropper && (
        <HeaderCropper
          onClose={() => setShowHeaderCropper(false)}
          onCropComplete={async (croppedImage: string) => {
            try {
              const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
              const response = await fetch("/api/users/header", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: currentUserData.id,
                  banner: croppedImage,
                }),
              });
              
              if (response.ok) {
                setUserProfile((prev: any) => ({
                  ...prev,
                  banner: croppedImage,
                }));
                localStorage.setItem("currentUserData", JSON.stringify({
                  ...currentUserData,
                  banner: croppedImage,
                }));
                toast({
                  description: "Header image updated successfully",
                  className: "border-primary/20 bg-card",
                });
              }
            } catch (error) {
              console.error("Failed to update header:", error);
              toast({
                description: "Failed to update header image",
                variant: "destructive",
              });
            }
          }}
        />
      )}
    </div>
  );
}
