import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { GridSkeleton } from "@/components/SkeletonLoader";
import SuggestedCreators from "./SuggestedCreators";
import fashionHero from "@assets/generated_images/Fashion_category_hero_image_37046966.png";
import musicHero from "@assets/generated_images/Music_category_hero_image_83aae00b.png";
import artHero from "@assets/generated_images/Art_category_hero_image_74aa53e3.png";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";
import { useState, useEffect } from "react";

interface ExploreProps {
  onSearchClick?: () => void;
  onPostClick?: (postId: string) => void;
}

const trendingCreators = [
  { username: "adikeafrica", followers: "12.5K" },
  { username: "kojoart", followers: "8.9K" },
  { username: "amaarabeats", followers: "15.2K" },
  { username: "zara_style", followers: "6.7K" },
];

const categories = [
  { name: "Fashion", image: fashionHero },
  { name: "Music", image: musicHero },
  { name: "Visual Art", image: artHero },
];

const popularPosts = [
  { id: "1", image: fashionImage },
  { id: "2", image: artImage },
  { id: "3", image: musicImage },
  { id: "4", image: fashionImage },
  { id: "5", image: artImage },
  { id: "6", image: musicImage },
];

// Mock posts for the 'all' tab, simulating a larger dataset
const mockAllPosts = Array.from({ length: 18 }, (_, i) => ({
  id: `mock-${i + 1}`,
  image: [fashionImage, artImage, musicImage][i % 3],
}));


export default function Explore({ onSearchClick, onPostClick }: ExploreProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Adjust delay as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="pb-20" data-testid="container-explore">
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 space-y-4">
          <h1 className="text-2xl font-bold" data-testid="text-explore-title">Explore</h1>
          <button
            onClick={onSearchClick}
            className="relative w-full text-left"
            data-testid="button-open-search"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <div className="pl-10 pr-4 py-2 rounded-full bg-muted text-muted-foreground text-sm">
              Search creators, hashtags...
            </div>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-8">
        <SuggestedCreators />

        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="text-trending-creators">
            Trending Creators
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {trendingCreators.map((creator) => (
              <div
                key={creator.username}
                className="flex flex-col items-center gap-2 min-w-20"
                data-testid={`creator-${creator.username}`}
              >
                <Avatar className="w-20 h-20 ring-2 ring-primary ring-offset-2 ring-offset-background">
                  <AvatarFallback>{creator.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium text-center truncate w-full">
                  {creator.username}
                </p>
                <p className="text-xs text-muted-foreground">{creator.followers}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="text-categories">
            Categories
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                className="relative h-36 rounded-xl overflow-hidden group hover-elevate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-300"
                data-testid={`category-${category.name.toLowerCase().replace(" ", "-")}`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 flex items-end p-4 transition-colors duration-300">
                  <p className="text-white font-semibold text-sm">{category.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="text-popular-posts">
            Popular Posts
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {popularPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => onPostClick?.(post.id)}
                className="aspect-square hover-elevate overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                data-testid={`popular-post-${post.id}`}
              >
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}