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
import BottomNav from "./components/BottomNav";

type AppState = "splash" | "onboarding" | "auth" | "main";
type MainView = "home" | "explore" | "create" | "notifications" | "profile";
type ModalView = "none" | "create" | "edit-profile" | "settings" | "comments";

export default function App() {
  const [appState, setAppState] = useState<AppState>("splash");
  const [activeTab, setActiveTab] = useState<MainView>("home");
  const [modalView, setModalView] = useState<ModalView>("none");
  const [commentsPostData, setCommentsPostData] = useState<any>(null);

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
        <div className="min-h-screen bg-background text-foreground">
          {activeTab === "home" && <HomeFeed />}
          {activeTab === "explore" && <Explore />}
          {activeTab === "notifications" && <Notifications />}
          {activeTab === "profile" && (
            <Profile
              isOwnProfile={true}
              onEditProfile={() => setModalView("edit-profile")}
              onSettings={() => setModalView("settings")}
            />
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
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
