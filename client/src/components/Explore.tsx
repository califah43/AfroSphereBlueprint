import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import fashionHero from "@assets/generated_images/Fashion_category_hero_image_37046966.png";
import musicHero from "@assets/generated_images/Music_category_hero_image_83aae00b.png";
import artHero from "@assets/generated_images/Art_category_hero_image_74aa53e3.png";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

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

export default function Explore() {
  return (
    <div className="pb-20" data-testid="container-explore">
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 space-y-4">
          <h1 className="text-2xl font-bold" data-testid="text-explore-title">Explore</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creators, hashtags..."
              className="pl-10 rounded-full bg-muted"
              data-testid="input-search"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-8">
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
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                className="relative h-32 rounded-lg overflow-hidden group hover-elevate"
                data-testid={`category-${category.name.toLowerCase().replace(" ", "-")}`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                  <p className="text-white font-semibold">{category.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="text-popular-posts">
            Popular Posts
          </h2>
          <div className="grid grid-cols-3 gap-1">
            {popularPosts.map((post) => (
              <button
                key={post.id}
                className="aspect-square hover-elevate overflow-hidden rounded"
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
