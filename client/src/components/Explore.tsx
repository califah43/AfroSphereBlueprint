import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Sparkles, Flame } from "lucide-react";
import { GridSkeleton } from "@/components/SkeletonLoader";
import SuggestedCreators from "./SuggestedCreators";
import FeaturedAfrican from "./FeaturedAfrican";
import TrendingAfrican from "./TrendingAfrican";
import GenreCard from "./GenreCard";
import { GENRE_LIST } from "@shared/genres";
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
  onHashtagClick?: (tag: string) => void;
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


interface TrendingHashtag { tag: string; count: number; posts: number; }
interface TrendingPostData { id: string; image: string; likes: number; caption: string; }

export default function Explore({ onSearchClick, onPostClick, onHashtagClick }: ExploreProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPostData[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [hashtagRes, postsRes] = await Promise.all([
          fetch('/api/trending/hashtags'),
          fetch('/api/trending/posts')
        ]);
        
        const hashtags = await hashtagRes.json();
        const posts = await postsRes.json();
        
        setTrendingHashtags(hashtags.slice(0, 10));
        setTrendingPosts(posts.slice(0, 6).map((p: any) => ({ 
          id: p.id, 
          image: p.image, 
          likes: p.likes || 0, 
          caption: p.caption 
        })));
      } catch (e) {
        console.log('Failed to fetch trending data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const displayPosts = trendingPosts.length > 0 ? trendingPosts : popularPosts;

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
        {trendingHashtags.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Trending Hashtags</h2>
            <div className="space-y-2">
              {trendingHashtags.slice(0, 5).map((tag) => (
                <button
                  key={tag.tag}
                  onClick={() => onHashtagClick?.(tag.tag)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-card hover:bg-card/80 transition-colors border border-border/50"
                  data-testid={`trending-hashtag-${tag.tag}`}
                >
                  <p className="font-semibold text-sm text-primary">#{tag.tag}</p>
                  <p className="text-xs text-muted-foreground">{tag.posts.toLocaleString()} posts</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <FeaturedAfrican />
        <TrendingAfrican />
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Explore Genres</h2>
          <div className="grid grid-cols-2 gap-3">
            {GENRE_LIST.map((genre) => (
              <GenreCard key={genre.id} genreId={genre.id.toUpperCase()} postsCount={Math.floor(Math.random() * 50) + 10} />
            ))}
          </div>
        </div>

        <SuggestedCreators />

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" data-testid="text-categories">
            <Sparkles className="h-5 w-5 text-primary" />
            Categories
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.name}
                className="relative h-40 rounded-lg overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-300"
                data-testid={`category-${category.name.toLowerCase().replace(" ", "-")}`}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent/0 flex flex-col items-start justify-end p-4 group-hover:from-black/95 transition-all duration-300">
                  <p className="text-white font-bold text-base">{category.name}</p>
                  <p className="text-white/70 text-xs mt-1">Browse</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" data-testid="text-popular-posts">
            <Flame className="h-5 w-5 text-primary" />
            Popular Posts
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {displayPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => onPostClick?.(post.id)}
                className="aspect-square overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-300 group hover-elevate"
                data-testid={`popular-post-${post.id}`}
              >
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}