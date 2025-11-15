import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard, { type Post } from "./PostCard";
import Stories from "./Stories";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

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

const mockStories = [
  { id: "1", username: "zara_style", hasStory: true, isViewed: false },
  { id: "2", username: "kojoart", hasStory: true, isViewed: false },
  { id: "3", username: "amaarabeats", hasStory: true, isViewed: true },
  { id: "4", username: "adike", hasStory: true, isViewed: false },
];

export default function HomeFeed({ onOpenShare }: HomeFeedProps) {
  const [activeCategory, setActiveCategory] = useState("for-you");

  return (
    <div className="pb-20" data-testid="container-home-feed">
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
          stories={mockStories}
          onAddStory={() => console.log("Add story")}
          onViewStory={(id) => console.log("View story:", id)}
        />
      </div>

      <div className="max-w-md mx-auto px-4 pt-4">
        {mockPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={(id) => console.log("Liked:", id)}
            onComment={(id) => console.log("Comment:", id)}
            onShare={(id) => console.log("Share:", id)}
            onBookmark={(id) => console.log("Bookmark:", id)}
            onOpenShare={onOpenShare}
          />
        ))}
      </div>
    </div>
  );
}
