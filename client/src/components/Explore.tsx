import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Sparkles, Flame, Bookmark, Plus } from "lucide-react";
import { GridSkeleton } from "@/components/SkeletonLoader";
import SuggestedCreators from "./SuggestedCreators";
import FeaturedAfrican from "./FeaturedAfrican";
import TrendingAfrican from "./TrendingAfrican";
import FollowedHashtagsFeed from "./FollowedHashtagsFeed";
import HashtagExplore from "./HashtagExplore";
import { useLanguage } from "@/context/LanguageContext";
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
  onUserProfileClick?: (username: string) => void;
  onCategoryClick?: (category: string) => void;
  onGenreClick?: (genreId: string) => void;
  onCreateClick?: () => void;
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
  { name: "Literature", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400" },
  { name: "Film", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400" },
  { name: "Design", image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400" },
  { name: "Food", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400" },
];

const popularPosts = [
  { id: "1", image: fashionImage },
  { id: "2", image: artImage },
  { id: "3", image: musicImage },
  { id: "4", image: fashionImage },
  { id: "5", image: artImage },
  { id: "6", image: musicImage },
];

interface TrendingHashtag { tag: string; count: number; posts: number; }
interface TrendingPostData { id: string; image: string; likes: number; caption: string; }

export default function Explore({ onSearchClick, onPostClick, onHashtagClick, onUserProfileClick, onCategoryClick, onGenreClick, onCreateClick }: ExploreProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("featured");
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(data);
          setShowSearchResults(true);
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const displayPosts = trendingPosts.length > 0 ? trendingPosts : popularPosts;

  return (
    <div className="pb-20" data-testid="container-explore">
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 space-y-4">
          <h1 className="text-2xl font-bold" data-testid="text-explore-title">Explore</h1>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search creators, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              data-testid="input-explore-search"
            />
            
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onUserProfileClick?.(user.username);
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
                      >
                        <Avatar className="h-10 w-10 border border-primary/20">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="object-cover" />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">@{user.username}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user.displayName || user.bio || "No bio"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">No creators found</div>
                )}
              </div>
            )}
          </div>
          
          {/* Tabs for Featured, Trending, Hashtags */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-9">
              <TabsTrigger value="featured" className="text-xs">
                Featured
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-xs flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="text-xs flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                Hashtags
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Featured Tab */}
      {activeTab === "featured" && (
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

          <FeaturedAfrican onCreatorClick={onUserProfileClick} />
          <TrendingAfrican onHashtagClick={onHashtagClick} />
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Explore Genres</h2>
            <div className="grid grid-cols-2 gap-3">
              {GENRE_LIST.map((genre) => (
                <GenreCard 
                  key={genre.id} 
                  genreId={genre.id.toUpperCase()} 
                  postsCount={Math.floor(Math.random() * 50) + 10}
                  onClick={() => onGenreClick?.(genre.id)}
                />
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
                  onClick={() => onCategoryClick?.(category.name.toLowerCase())}
                  className="relative h-40 rounded-lg overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-300 hover-elevate"
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
      )}

      {/* Trending Tab */}
      {activeTab === "trending" && (
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Trending Now
            </h2>
            
            {/* Trending Hashtags */}
            <div className="mb-6">
              <h3 className="text-base font-semibold mb-3">Hot Hashtags</h3>
              <div className="space-y-2">
                {trendingHashtags.map((tag) => (
                  <button
                    key={tag.tag}
                    onClick={() => onHashtagClick?.(tag.tag)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-card hover:bg-card/80 transition-colors border border-border/50"
                    data-testid={`trending-hashtag-explore-${tag.tag}`}
                  >
                    <p className="font-semibold text-sm text-primary">#{tag.tag}</p>
                    <p className="text-xs text-muted-foreground">{tag.posts.toLocaleString()} posts • {tag.count} followers</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Posts */}
            <div>
              <h3 className="text-base font-semibold mb-3">Trending Posts</h3>
              <div className="grid grid-cols-3 gap-2">
                {displayPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => onPostClick?.(post.id)}
                    className="aspect-square overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-300 group hover-elevate relative"
                    data-testid={`trending-post-${post.id}`}
                  >
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Flame className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hashtags Tab */}
      {activeTab === "hashtags" && (
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {(() => {
            const userId = localStorage.getItem("currentUserId") || "";
            return (
              <HashtagExplore userId={userId} onHashtagClick={onHashtagClick} />
            );
          })()}
        </div>
      )}

      {/* Floating Create Button */}
      <Button
        onClick={onCreateClick}
        size="icon"
        className="fixed right-4 bottom-24 h-14 w-14 rounded-full gold-glow shadow-lg transition-all hover:scale-110"
        data-testid="button-create-post-floating-explore"
      >
        <Plus className="h-7 w-7" />
      </Button>
    </div>
  );
}
