import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import SplashScreen from "./components/SplashScreen";
import OnboardingSlides from "./components/OnboardingSlides";
import AuthScreen from "./components/AuthScreen";
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
import PostDetail from "./components/PostDetail";
import FollowersList from "./components/FollowersList";
import ShareSheet from "./components/ShareSheet";
import BottomNav from "./components/BottomNav";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";

type AppState = "splash" | "onboarding" | "auth" | "main";
type MainView = "home" | "explore" | "create" | "notifications" | "profile";
type ModalView = "none" | "create" | "edit-profile" | "settings" | "comments" | "search" | "hashtag" | "post-detail" | "followers" | "share" | "user-profile";

export default function App() {
  const [appState, setAppState] = useState<AppState>("splash");
  const [activeTab, setActiveTab] = useState<MainView>("home");
  const [modalView, setModalView] = useState<ModalView>("none");
  const [commentsPostData, setCommentsPostData] = useState<any>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [selectedUsername, setSelectedUsername] = useState<string>("");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleSplashComplete = () => {
    setAppState("onboarding");
  };

  const handleOnboardingComplete = () => {
    setAppState("auth");
  };

  const handleAuthComplete = () => {
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

  const handleLogout = () => {
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

  if (appState === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />;
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
    return <AuthScreen onAuthComplete={handleAuthComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="w-full max-w-[430px] h-screen max-h-screen bg-background text-foreground flex flex-col">
            {activeTab === "home" && <HomeFeed onOpenShare={() => setModalView("share")} />}
          {activeTab === "explore" && (
            <div className="flex-1 overflow-y-auto">
              <Explore
                onSearchClick={() => setModalView("search")}
                onPostClick={handleOpenPostDetail}
              />
            </div>
          )}
          {activeTab === "notifications" && (
            <div className="flex-1 overflow-y-auto">
              <Notifications />
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
              onPost={(data) => {
                console.log("Posted:", data);
                setModalView("none");
              }}
            />
          )}

          {modalView === "edit-profile" && (
            <EditProfile
              onClose={() => setModalView("none")}
              onSave={(data) => {
                console.log("Profile updated:", data);
                setModalView("none");
              }}
            />
          )}

          {modalView === "settings" && (
            <Settings
              onClose={() => setModalView("none")}
              onLogout={handleLogout}
            />
          )}

          {modalView === "comments" && commentsPostData && (
            <Comments
              postId={commentsPostData.postId}
              postImage={commentsPostData.image}
              postCaption={commentsPostData.caption}
              onClose={() => setModalView("none")}
            />
          )}

          {modalView === "search" && (
            <SearchResults
              onClose={() => setModalView("none")}
              onHashtagClick={handleOpenHashtagFeed}
              onUserClick={(username) => {
                console.log("Navigate to user:", username);
                setModalView("none");
              }}
            />
          )}

          {modalView === "hashtag" && selectedHashtag && (
            <HashtagFeed
              hashtag={selectedHashtag}
              onClose={() => setModalView("none")}
            />
          )}

          {modalView === "post-detail" && selectedPostId && (
            <PostDetail
              postId={selectedPostId}
              author={{ username: "adikeafrica" }}
              imageUrl={fashionImage}
              caption="Celebrating our roots with modern style. Ankara fusion fashion dropping soon! 🔥 #AfricanFashion"
              likes={1247}
              timeAgo="2h ago"
              comments={[
                {
                  id: "1",
                  author: "zara_style",
                  text: "This is absolutely stunning! 🔥",
                  likes: 23,
                  timeAgo: "1h ago",
                },
                {
                  id: "2",
                  author: "kwame_creative",
                  text: "Love the fusion of traditional and modern!",
                  likes: 15,
                  timeAgo: "45m ago",
                },
              ]}
              onClose={() => setModalView("none")}
            />
          )}

          {modalView === "followers" && (
            <FollowersList
              username="adikeafrica"
              followerCount="1.2K"
              followingCount="485"
              onClose={() => setModalView("none")}
            />
          )}

          {modalView === "share" && (
            <ShareSheet
              postUrl="https://afrosphere.app/post/123"
              onClose={() => setModalView("none")}
              onShare={(platform) => console.log("Shared to:", platform)}
            />
          )}

          {modalView === "user-profile" && selectedUsername && (
            <div className="flex-1 overflow-y-auto">
              <Profile
                isOwnProfile={selectedUsername === "adikeafrica"}
                username={selectedUsername}
                onClose={() => setModalView("none")}
                onEditProfile={() => setModalView("edit-profile")}
                onSettings={() => setModalView("settings")}
                onPostClick={handleOpenPostDetail}
                onFollowersClick={() => setModalView("followers")}
                onFollowingClick={() => setModalView("followers")}
              />
            </div>
          )}
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
