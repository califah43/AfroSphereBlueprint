import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard, { type Post } from "./PostCard";
import Stories from "./Stories";
import StoryViewer from "./StoryViewer";
import { Loader2 } from "lucide-react";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

// Placeholder for FeedSkeleton component
const FeedSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-300 rounded-lg"></div>
    <div className="h-12 bg-gray-300 rounded-lg"></div>
    <div className="h-12 bg-gray-300 rounded-lg"></div>
    <div className="h-12 bg-gray-300 rounded-lg"></div>
  </div>
);

interface HomeFeedProps {
  onOpenShare?: () => void;
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: { username: "adikeafrica" },
    imageUrl: fashionImage,
    caption: "Celebrating our roots with modern style. Ankara fusion fashion dropping soon! 🔥 #AfricanFashion",
    likes: 1247,
    comments: 89,
    timeAgo: "2h ago",
  },
  {
    id: "2",
    author: { username: "kojoart" },
    imageUrl: artImage,
    caption: "New piece inspired by Adinkra symbols. The journey continues. #AfricanArt #ContemporaryArt",
    likes: 892,
    comments: 54,
    timeAgo: "5h ago",
  },
  {
    id: "3",
    author: { username: "amaarabeats" },
    imageUrl: musicImage,
    caption: "Late night sessions creating the future of Afrobeats. Studio vibes 🎵 #AfricanMusic #Producer",
    likes: 2103,
    comments: 156,
    timeAgo: "1d ago",
  },
];

const mockStoryData = [
  { id: "1", username: "zara_style", imageUrl: "https://picsum.photos/seed/picsum/200/300", hasStory: true, isViewed: false },
  { id: "2", username: "kojoart", imageUrl: "https://picsum.photos/seed/picsum/200/300", hasStory: true, isViewed: false },
  { id: "3", username: "amaarabeats", imageUrl: "https://picsum.photos/seed/picsum/200/300", hasStory: true, isViewed: true },
  { id: "4", username: "adike", imageUrl: "https://picsum.photos/seed/picsum/200/300", hasStory: true, isViewed: false },
];

export default function HomeFeed({ onOpenShare }: HomeFeedProps) {
  const [activeCategory, setActiveCategory] = useState("for-you");
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const filteredPosts = activeCategory === "for-you"
    ? mockPosts
    : mockPosts.filter(post =>
        post.caption.toLowerCase().includes(activeCategory)
      );

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      // Simulate refresh
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1500);
    } else {
      setPullDistance(0);
    }
  };

  const handleViewStory = (storyId: string) => {
    const index = mockStoryData.findIndex(s => s.id === storyId);
    if (index !== -1) {
      setSelectedStoryIndex(index);
      setShowStoryViewer(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };


  return (
    <>
      <div
        className="pb-20"
        data-testid="container-home-feed"
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ overflowY: "auto", height: "100vh" }} // Ensure scrollable
      >
        {pullDistance > 0 && !isRefreshing && (
          <div className="flex justify-center items-center py-4" style={{ height: `${pullDistance}px` }}>
            <Loader2 className="text-primary" size={20} style={{ opacity: pullDistance / 80 }} />
          </div>
        )}
        {isRefreshing && (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        )}

        <div className="sticky top-0 bg-background z-10 border-b border-border">
          <div className="max-w-md mx-auto px-4 py-3">
            <h1 className="text-2xl font-bold mb-4" data-testid="text-feed-title">AfroSphere</h1>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="w-full grid grid-cols-5 h-auto">
                <TabsTrigger value="for-you" className="text-xs" data-testid="tab-for-you">
                  For You
                </TabsTrigger>
                <TabsTrigger value="culture" className="text-xs" data-testid="tab-culture">
                  Culture
                </TabsTrigger>
                <TabsTrigger value="music" className="text-xs" data-testid="tab-music">
                  Music
                </TabsTrigger>
                <TabsTrigger value="art" className="text-xs" data-testid="tab-art">
                  Art
                </TabsTrigger>
                <TabsTrigger value="lifestyle" className="text-xs" data-testid="tab-lifestyle">
                  Lifestyle
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="max-w-md mx-auto pt-4 border-b border-border">
          <Stories
            stories={mockStoryData}
            onAddStory={() => console.log("Add story")}
            onViewStory={handleViewStory}
          />
        </div>

        <div className="max-w-md mx-auto px-4 pt-4">
          {isInitialLoading ? (
            <FeedSkeleton />
          ) : (
            <>
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(id) => console.log("Liked:", id)}
                  onComment={(id) => console.log("Comment:", id)}
                  onShare={(id) => onOpenShare?.()}
                  onBookmark={(id) => console.log("Bookmark:", id)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {showStoryViewer && (
        <StoryViewer
          stories={mockStoryData}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setShowStoryViewer(false)}
        />
      )}
    </>
  );
}