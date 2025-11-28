import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, X, Hash, TrendingUp, Flame, Users as UsersIcon } from "lucide-react";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

interface SearchResultsProps {
  onClose: () => void;
  onHashtagClick?: (hashtag: string) => void;
  onUserClick?: (username: string) => void;
  onPostClick?: (postId: string) => void;
}

const mockUsers = [
  { username: "adikeafrica", name: "Adike Africa", followers: "1.2K" },
  { username: "kojoart", name: "Kojo Art", followers: "8.9K" },
  { username: "amaarabeats", name: "Amaara Beats", followers: "15.2K" },
];

const mockHashtags = [
  { tag: "AfricanFashion", posts: "12.5K", trending: true },
  { tag: "AfroBeats", posts: "45.2K", trending: true },
  { tag: "AfricanArt", posts: "8.9K", trending: false },
  { tag: "AnkaraPrint", posts: "6.3K", trending: false },
  { tag: "AfricanCulture", posts: "23.1K", trending: true },
  { tag: "AfricanMusic", posts: "18.7K", trending: false },
  { tag: "AfroVibes", posts: "31.4K", trending: true },
];

const mockPosts = [
  { id: "1", image: fashionImage },
  { id: "2", image: artImage },
  { id: "3", image: musicImage },
  { id: "4", image: fashionImage },
  { id: "5", image: artImage },
  { id: "6", image: musicImage },
];

export default function SearchResults({ onClose, onHashtagClick, onUserClick, onPostClick }: SearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredHashtags = searchQuery.startsWith("#")
    ? mockHashtags.filter((h) =>
        h.tag.toLowerCase().includes(searchQuery.slice(1).toLowerCase())
      )
    : [];

  const trendingHashtags = mockHashtags.filter((h) => h.trending);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 z-20">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover-elevate"
            data-testid="button-close-search"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Search creators, hashtags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              className="pl-10 rounded-full bg-muted/50 border-primary/20 h-10 focus:ring-primary/50"
              autoFocus
              data-testid="input-search-query"
            />

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.startsWith("#") && filteredHashtags.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden z-10">
                {filteredHashtags.slice(0, 5).map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    onClick={() => {
                      onHashtagClick?.(hashtag.tag);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 border-b border-border/30 last:border-b-0 transition-all group"
                    data-testid={`suggestion-${hashtag.tag}`}
                  >
                    <Hash className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">#{hashtag.tag}</p>
                      <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                    </div>
                    {hashtag.trending && (
                      <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                        <Flame className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary font-semibold">Trending</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Trending Suggestions */}
            {showSuggestions && !searchQuery.startsWith("#") && searchQuery.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden z-10">
                <div className="p-4 border-b border-border/30 bg-muted/20">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Trending Now
                  </p>
                </div>
                {trendingHashtags.slice(0, 4).map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    onClick={() => {
                      onHashtagClick?.(hashtag.tag);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 border-b border-border/30 last:border-b-0 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Hash className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">#{hashtag.tag}</p>
                      <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                    </div>
                    <Flame className="h-4 w-4 text-orange-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="sticky top-14 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-2 z-10">
          <TabsList className="w-full grid grid-cols-4 bg-muted/30">
            <TabsTrigger value="all" data-testid="tab-all" className="data-[state=active]:bg-background">All</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users" className="data-[state=active]:bg-background">Creators</TabsTrigger>
            <TabsTrigger value="hashtags" data-testid="tab-hashtags" className="data-[state=active]:bg-background">Tags</TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-posts" className="data-[state=active]:bg-background">Posts</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* All Tab */}
          <TabsContent value="all" className="mt-0 px-4 py-6 space-y-8">
            {/* Users Section */}
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Creators
              </h3>
              <div className="space-y-3">
                {mockUsers.slice(0, 3).map((user) => (
                  <button
                    key={user.username}
                    onClick={() => onUserClick?.(user.username)}
                    className="w-full flex items-center gap-3 p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all group"
                    data-testid={`user-result-${user.username}`}
                  >
                    <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                      <AvatarFallback className="font-bold text-lg">{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-white font-semibold h-8"
                      data-testid={`button-follow-${user.username}`}
                    >
                      Follow
                    </Button>
                  </button>
                ))}
              </div>
            </div>

            {/* Hashtags Section */}
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Trending Tags
              </h3>
              <div className="space-y-3">
                {mockHashtags.slice(0, 3).map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    onClick={() => onHashtagClick?.(hashtag.tag)}
                    className="w-full flex items-center gap-3 p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all group"
                    data-testid={`hashtag-result-${hashtag.tag}`}
                  >
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-orange-500/30 transition-all">
                      <Hash className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">#{hashtag.tag}</p>
                      <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                    </div>
                    {hashtag.trending && (
                      <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-full">
                        <Flame className="h-3 w-3 text-orange-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-0 px-4 py-6">
            <div className="space-y-3">
              {mockUsers.map((user) => (
                <button
                  key={user.username}
                  onClick={() => onUserClick?.(user.username)}
                  className="w-full flex items-center gap-3 p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all group"
                  data-testid={`user-${user.username}`}
                >
                  <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                    <AvatarFallback className="font-bold text-lg">{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">@{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.followers} followers</p>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold h-8"
                  >
                    Follow
                  </Button>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Hashtags Tab */}
          <TabsContent value="hashtags" className="mt-0 px-4 py-6">
            <div className="space-y-3">
              {mockHashtags.map((hashtag) => (
                <button
                  key={hashtag.tag}
                  onClick={() => onHashtagClick?.(hashtag.tag)}
                  className="w-full flex items-center gap-3 p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all group"
                  data-testid={`hashtag-${hashtag.tag}`}
                >
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-orange-500/30 transition-all">
                    <Hash className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">#{hashtag.tag}</p>
                    <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                  </div>
                  {hashtag.trending && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1.5 rounded-full border border-orange-500/30">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-500">Trending</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-0 p-4">
            <div className="grid grid-cols-3 gap-2">
              {mockPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => {
                    onPostClick?.(post.id);
                    onClose();
                  }}
                  className="aspect-square hover-elevate overflow-hidden rounded-lg ring-1 ring-border/50 group transition-all duration-300 relative"
                  data-testid={`search-post-${post.id}`}
                >
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </button>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
