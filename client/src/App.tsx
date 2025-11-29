import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/LanguageContext";
import { requestNotificationPermission, setupMessageListener } from "./lib/fcm";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import SplashScreen from "./components/SplashScreen";
import OnboardingSlides from "./components/OnboardingSlides";
import AuthScreen from "./components/AuthScreen";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import HomeFeed from "./components/HomeFeed";
import Explore from "./components/Explore";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import CreatePost from "./components/CreatePost";
import EditProfile from "./components/EditProfile";
import Settings from "./components/Settings";
import Comments from "./components/Comments";
import SearchResults from "./components/SearchResults";
import HashtagFeed from "./components/HashtagFeed";
import CategoryFeed from "./components/CategoryFeed";
import GenreFeed from "./components/GenreFeed";
import PostDetail from "./components/PostDetail";
import PostDetailModal from "./components/PostDetailModal";
import FollowersList from "./components/FollowersList";
import ShareSheet from "./components/ShareSheet";
import BottomNav from "./components/BottomNav";
import PostSignupUsername from "./components/PostSignupUsername";
import PostSignupProfile from "./components/PostSignupProfile";
import PostSignupPreferences from "./components/PostSignupPreferences";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";

type AppState = "splash" | "onboarding" | "auth" | "post-signup-username" | "post-signup-profile" | "post-signup-preferences" | "main" | "admin";
type MainView = "home" | "explore" | "create" | "notifications" | "profile";
type ModalView = "none" | "create" | "edit-profile" | "settings" | "comments" | "search" | "hashtag" | "post-detail" | "followers" | "share" | "user-profile" | "category" | "genre";

export default function App() {
  const [appState, setAppState] = useState<AppState>("splash");
  const [activeTab, setActiveTab] = useState<MainView>("home");
  const [modalView, setModalView] = useState<ModalView>("none");
  const [commentsPostData, setCommentsPostData] = useState<any>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [clickResetTimer, setClickResetTimer] = useState<NodeJS.Timeout | null>(null);
  const [adminSection, setAdminSection] = useState("dashboard");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupProfileData, setSignupProfileData] = useState({ avatar: "", banner: "", bio: "", profession: "" });
  const [textSize, setTextSize] = useState<"normal" | "large" | "extra-large">(() => {
    const saved = localStorage.getItem("textSize") as "normal" | "large" | "extra-large" | null;
    return saved || "normal";
  });

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "false") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    // Remove any existing text size classes
    document.documentElement.classList.remove("text-size-large", "text-size-extra-large");
    // Add the new text size class if not normal
    const textSizeClass = textSize === "normal" ? "" : `text-size-${textSize}`;
    if (textSizeClass) {
      document.documentElement.classList.add(textSizeClass);
    }
  }, [textSize]);

  // Apply text size immediately on app startup
  useEffect(() => {
    const saved = localStorage.getItem("textSize") as "normal" | "large" | "extra-large" | null;
    if (saved && saved !== "normal") {
      document.documentElement.classList.add(`text-size-${saved}`);
    }
  }, []);

  // Check if user is already logged in (session persistence)
  useEffect(() => {
    const checkExistingSession = async () => {
      const userId = localStorage.getItem("currentUserId");
      const userData = localStorage.getItem("currentUserData");
      
      // If user was previously logged in, fetch fresh data from backend
      if (userId && userData) {
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (response.ok) {
            const freshData = await response.json();
            localStorage.setItem("currentUserData", JSON.stringify(freshData));
          } else {
            // If user ID not found, clear session and go to auth
            localStorage.removeItem("currentUserId");
            localStorage.removeItem("currentUserData");
            setAppState("auth");
            return;
          }
        } catch (error) {
          // Silently handle fetch errors during session check
        }
        
        // Show splash screen briefly then go to main
        const timer = setTimeout(() => {
          setAppState("main");
        }, 1500);
        return () => clearTimeout(timer);
      }
    };
    
    checkExistingSession();
  }, []);

  // Initialize FCM and request notification permission
  useEffect(() => {
    const initFCM = async () => {
      try {
        // Register service worker for background messages
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => {
            // Service worker registration failed - this is optional
          });
        }

        // Request notification permission
        const token = await requestNotificationPermission();
        if (token) {
          // Save token to backend
          await fetch("/api/notifications/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, userId: "current-user" }),
          }).catch(() => {
            // FCM token save failed - notifications will still work
          });
        }

        // Setup listener for foreground messages
        setupMessageListener((payload) => {
          // Show notification or update UI
          if (payload.notification) {
            new Notification(payload.notification.title || "AfroSphere", {
              body: payload.notification.body,
              icon: "/logo.png",
            });
          }
        });
      } catch (error) {
        // FCM initialization skipped - app continues to work without notifications
      }
    };

    initFCM();
  }, []);

  // Reset click count after 3 seconds of inactivity
  useEffect(() => {
    if (logoClickCount > 0) {
      if (clickResetTimer) {
        clearTimeout(clickResetTimer);
      }
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 3000);
      setClickResetTimer(timer);
    }
    return () => {
      if (clickResetTimer) {
        clearTimeout(clickResetTimer);
      }
    };
  }, [logoClickCount]);

  const handleSplashComplete = () => {
    setAppState("onboarding");
  };

  const handleOnboardingComplete = () => {
    setAppState("auth");
  };

  const handleAuthComplete = (isNewSignup: boolean) => {
    if (isNewSignup) {
      setAppState("post-signup-username");
    } else {
      setAppState("main");
    }
  };

  const handleUsernameComplete = (username: string) => {
    setSignupUsername(username);
    setAppState("post-signup-profile");
  };

  const handleProfileComplete = (data: { avatar: string; banner: string; bio: string; profession: string }) => {
    setSignupProfileData(data);
    setAppState("post-signup-preferences");
  };

  const handlePreferencesComplete = async (interests: string[]) => {
    const userId = localStorage.getItem("currentUserId");
    const currentUserData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
    
    // Send all profile data including avatar and banner to backend
    const profileData = {
      displayName: signupUsername,
      bio: signupProfileData.bio || "",
      profession: signupProfileData.profession || "",
      avatar: signupProfileData.avatar || "",
      banner: signupProfileData.banner || "",
    };
    
    // Save to localStorage with all data including images
    const updated = {
      ...currentUserData,
      ...profileData,
      username: signupUsername,
      interests: interests,
    };
    localStorage.setItem("currentUserData", JSON.stringify(updated));

    // Save to backend with avatar and banner
    if (userId) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData),
        });
        
        if (response.ok) {
          const savedUser = await response.json();
          // Update localStorage with saved data including images
          localStorage.setItem("currentUserData", JSON.stringify({
            ...savedUser,
            avatar: signupProfileData.avatar || "",
            banner: signupProfileData.banner || "",
          }));
        }
      } catch (e) {
        // Continue even if save fails - user data is in localStorage
      }
    }

    setAppState("main");
  };

  const handleTabChange = (tab: string) => {
    if (tab === "create") {
      setModalView("create");
    } else {
      setActiveTab(tab as MainView);
      setModalView("none");
    }
  };

  const handleOpenComments = (postId: string, image: string, caption: string) => {
    setCommentsPostData({ postId, image, caption });
    setModalView("comments");
  };

  const handleCommentAdded = (newCommentCount: number) => {
    // Refetch posts to update comment counts in HomeFeed
    if (activeTab === "home") {
      // Trigger refetch by modifying a state that HomeFeed watches
      // This will cause the posts query to refetch
      window.dispatchEvent(new CustomEvent('refreshPosts'));
    }
  };

  // iOS-style swipe back gesture
  useSwipeBack({
    onSwipeBack: () => {
      // Close any open modal first
      if (modalView !== "none") {
        setModalView("none");
      }
    },
    enabled: modalView !== "none", // Only enable swipe when modal is open
  });

  const handleLogout = () => {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserData");
    setAppState("auth");
    setActiveTab("home");
    setModalView("none");
  };

  const handleOpenPostDetail = (postId: string) => {
    setSelectedPostId(postId);
    setModalView("post-detail");
  };

  const handleOpenHashtagFeed = (hashtag: string) => {
    setSelectedHashtag(hashtag);
    setModalView("hashtag");
  };

  const handleOpenUserProfile = (username: string) => {
    setSelectedUsername(username);
    setModalView("user-profile");
  };

  const handleLogoClick = () => {
    if (logoClickCount >= 17) {
      setLogoClickCount(18);
      setShowAdminLogin(true);
    } else {
      setLogoClickCount(logoClickCount + 1);
    }
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    setAppState("admin");
    setLogoClickCount(0);
  };

  if (appState === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} onLogoClick={handleLogoClick} />;
  }

  if (appState === "onboarding") {
    return (
      <OnboardingSlides
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
      />
    );
  }

  if (appState === "auth") {
    return (
      <>
        <AuthScreen onAuthComplete={handleAuthComplete} onLogoClick={handleLogoClick} />
        {showAdminLogin && (
          <AdminLogin
            onClose={() => setShowAdminLogin(false)}
            onLoginSuccess={handleAdminLoginSuccess}
          />
        )}
      </>
    );
  }

  if (appState === "post-signup-username") {
    return <PostSignupUsername onComplete={handleUsernameComplete} />;
  }

  if (appState === "post-signup-profile") {
    return <PostSignupProfile username={signupUsername} onComplete={handleProfileComplete} />;
  }

  if (appState === "post-signup-preferences") {
    return <PostSignupPreferences onComplete={handlePreferencesComplete} />;
  }

  if (appState === "admin") {
    return (
      <AdminDashboard 
        onNavigate={(section) => setAdminSection(section)}
        onLogout={() => {
          setAppState("auth");
          setLogoClickCount(0);
          setAdminSection("dashboard");
        }}
      />
    );
  }

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="w-full max-w-[430px] h-screen max-h-screen bg-background text-foreground flex flex-col">
            {activeTab === "home" && (
            <div className="flex-1 overflow-y-auto">
              <HomeFeed 
                onOpenShare={() => setModalView("share")}
                onUserProfileClick={handleOpenUserProfile}
                onHashtagClick={handleOpenHashtagFeed}
                onCommentClick={handleOpenComments}
              />
            </div>
          )}
          {activeTab === "explore" && (
            <div className="flex-1 overflow-y-auto">
              <Explore
                onSearchClick={() => setModalView("search")}
                onPostClick={handleOpenPostDetail}
                onHashtagClick={handleOpenHashtagFeed}
                onUserProfileClick={handleOpenUserProfile}
                onCategoryClick={(category) => {
                  setSelectedCategory(category);
                  setModalView("category");
                }}
                onGenreClick={(genreId) => {
                  setSelectedGenre(genreId);
                  setModalView("genre");
                }}
              />
            </div>
          )}
          {activeTab === "notifications" && (
            <div className="flex-1 overflow-y-auto">
              <Notifications onUserClick={handleOpenUserProfile} />
            </div>
          )}
          {activeTab === "profile" && (
            <div className="flex-1 overflow-y-auto">
              <Profile
                isOwnProfile={true}
                onEditProfile={() => setModalView("edit-profile")}
                onSettings={() => setModalView("settings")}
                onPostClick={handleOpenPostDetail}
                onFollowersClick={() => setModalView("followers")}
                onFollowingClick={() => setModalView("followers")}
              />
            </div>
          )}

          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

          {modalView === "create" && (
            <CreatePost
              onClose={() => setModalView("none")}
              onPost={() => {
                setModalView("none");
              }}
              onNavigateHome={() => {
                setActiveTab("home");
                setModalView("none");
              }}
            />
          )}

          {modalView === "edit-profile" && (
            <EditProfile
              onClose={() => setModalView("none")}
              onSave={() => {
                setModalView("none");
              }}
            />
          )}

          {modalView === "settings" && (() => {
            console.log("Rendering Settings modal - modalView is:", modalView);
            const currentUserId = localStorage.getItem("currentUserId");
            return (
              <Settings
                userId={currentUserId || undefined}
                onClose={() => setModalView("none")}
                onLogout={handleLogout}
                onEditProfile={() => setModalView("edit-profile")}
                onTextSizeChange={(size) => {
                  setTextSize(size);
                  localStorage.setItem("textSize", size);
                }}
              />
            );
          })()}

          {modalView === "comments" && commentsPostData && (
            <Comments
              postId={commentsPostData.postId}
              postImage={commentsPostData.image}
              postCaption={commentsPostData.caption}
              onClose={() => setModalView("none")}
              onCommentAdded={handleCommentAdded}
            />
          )}

          {modalView === "search" && (
            <SearchResults
              onClose={() => setModalView("none")}
              onHashtagClick={handleOpenHashtagFeed}
              onUserClick={handleOpenUserProfile}
              onPostClick={handleOpenPostDetail}
            />
          )}

          {modalView === "hashtag" && selectedHashtag && (
            <HashtagFeed
              hashtag={selectedHashtag}
              onClose={() => setModalView("none")}
            />
          )}

          {modalView === "category" && selectedCategory && (
            <CategoryFeed
              category={selectedCategory}
              onClose={() => setModalView("none")}
              onPostClick={handleOpenPostDetail}
            />
          )}

          {modalView === "genre" && selectedGenre && (
            <GenreFeed
              genreId={selectedGenre}
              onClose={() => setModalView("none")}
              onPostClick={handleOpenPostDetail}
            />
          )}

          {modalView === "post-detail" && selectedPostId && (
            <PostDetailModal
              postId={selectedPostId}
              onClose={() => setModalView("none")}
            />
          )}

          {modalView === "followers" && (() => {
            const currentUserData = localStorage.getItem("currentUserData") ? JSON.parse(localStorage.getItem("currentUserData")!) : {};
            return (
              <FollowersList
                username={currentUserData.username || "user"}
                followerCount={currentUserData.followerCount?.toString() || "0"}
                followingCount={currentUserData.followingCount?.toString() || "0"}
                onClose={() => setModalView("none")}
                onUserClick={(username) => {
                  setSelectedUsername(username);
                  setModalView("user-profile");
                }}
              />
            );
          })()}

          {modalView === "share" && (
            <ShareSheet
              postUrl="https://afrosphere.app/post/123"
              onClose={() => setModalView("none")}
              onShare={(platform) => console.log("Shared to:", platform)}
            />
          )}

          {modalView === "user-profile" && selectedUsername && (() => {
            const currentUserData = localStorage.getItem("currentUserData") ? JSON.parse(localStorage.getItem("currentUserData")!) : {};
            const currentUsername = currentUserData.username || "";
            return (
              <div className="flex-1 overflow-y-auto">
                <Profile
                  isOwnProfile={selectedUsername === currentUsername}
                  username={selectedUsername}
                  onClose={() => setModalView("none")}
                  onEditProfile={() => setModalView("edit-profile")}
                  onSettings={() => setModalView("settings")}
                  onPostClick={handleOpenPostDetail}
                  onFollowersClick={() => setModalView("followers")}
                  onFollowingClick={() => setModalView("followers")}
                />
              </div>
            );
          })()}
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}
