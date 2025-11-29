import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, X, Hash, TrendingUp, Flame, Users as UsersIcon, Loader2 } from "lucide-react";
import type { User, Post, Hashtag } from "@shared/schema";

interface SearchResultsProps {
  onClose: () => void;
  onHashtagClick?: (hashtag: string) => void;
  onUserClick?: (username: string) => void;
  onPostClick?: (postId: string) => void;
}

export default function SearchResults({ onClose, onHashtagClick, onUserClick, onPostClick }: SearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchHashtags, setSearchHashtags] = useState<Hashtag[]>([]);
  const [searchPosts, setSearchPosts] = useState<(Post & { username?: string })[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch trending hashtags on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending/hashtags");
        const data = await res.json();
        setTrendingHashtags(data.slice(0, 10));
      } catch (error) {
        console.log("Failed to fetch trending hashtags");
      }
    };
    fetchTrending();
  }, []);

  // Search effect with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length === 0) {
        setSearchUsers([]);
        setSearchHashtags([]);
        setSearchPosts([]);
        return;
      }

      setIsLoading(true);
      try {
        const [usersRes, hashtagsRes, postsRes] = await Promise.all([
          fetch(`/api/search/users?q=${encodeURIComponent(searchQuery)}`),
          fetch(`/api/search/hashtags?q=${encodeURIComponent(searchQuery)}`),
          fetch(`/api/search/posts?q=${encodeURIComponent(searchQuery)}`),
        ]);

        const users = await usersRes.json();
        const hashtags = await hashtagsRes.json();
        const posts = await postsRes.json();

        setSearchUsers(users.slice(0, 10));
        setSearchHashtags(hashtags.slice(0, 10));
        setSearchPosts(posts.slice(0, 10));
      } catch (error) {
        console.log("Failed to search");
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayUsers = searchQuery.length > 0 ? searchUsers : [];
  const displayHashtags = searchQuery.length > 0 ? searchHashtags : trendingHashtags;
  const displayPosts = searchQuery.length > 0 ? searchPosts : [];

  const hashtagSuggestions =
    searchQuery.startsWith("#") && searchQuery.length > 1
      ? displayHashtags.filter((h) =>
          h.tag.toLowerCase().includes(searchQuery.slice(1).toLowerCase())
        )
      : [];

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
            {showSuggestions && hashtagSuggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden z-10 max-h-60 overflow-y-auto">
                {hashtagSuggestions.slice(0, 5).map((hashtag) => (
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
                      <p className="text-xs text-muted-foreground">{(hashtag.usageCount || 0).toLocaleString()} uses</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Trending Suggestions */}
            {showSuggestions && searchQuery.length === 0 && displayHashtags.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden z-10 max-h-60 overflow-y-auto">
                <div className="p-4 border-b border-border/30 bg-muted/20 sticky top-0">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Trending Now
                  </p>
                </div>
                {displayHashtags.slice(0, 4).map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    onClick={() => {
                      onHashtagClick?.(hashtag.tag);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 border-b border-border/30 last:border-b-0 transition-all group"
                    data-testid={`trending-${hashtag.tag}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Hash className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">#{hashtag.tag}</p>
                      <p className="text-xs text-muted-foreground">{(hashtag.usageCount || 0).toLocaleString()} uses</p>
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
            <TabsTrigger value="all" data-testid="tab-all" className="data-[state=active]:bg-background">
              All
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users" className="data-[state=active]:bg-background">
              Creators
            </TabsTrigger>
            <TabsTrigger value="hashtags" data-testid="tab-hashtags" className="data-[state=active]:bg-background">
              Tags
            </TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-posts" className="data-[state=active]:bg-background">
              Posts
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.length === 0 && (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Start typing to search creators and hashtags</p>
            </div>
          )}

          {isLoading && searchQuery.length > 0 && (
            <div className="px-4 py-12 text-center flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && searchQuery.length > 0 && displayUsers.length === 0 && displayHashtags.length === 0 && displayPosts.length === 0 && (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <p className="text-sm">No results found for "{searchQuery}"</p>
            </div>
          )}

          {/* All Tab */}
          {!isLoading && (
            <TabsContent value="all" className="mt-0 px-4 py-6 space-y-8">
              {/* Users Section */}
              {displayUsers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    Creators
                  </h3>
                  <div className="space-y-3">
                    {displayUsers.slice(0, 3).map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onUserClick?.(user.username);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all group"
                        data-testid={`user-result-${user.username}`}
                      >
                        <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                          {user.profileImageUrl && <img src={user.profileImageUrl} alt={user.username} />}
                          <AvatarFallback className="font-bold text-lg">{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-sm group-hover:text-primary transition-colors">@{user.username}</p>
                          <p className="text-xs text-muted-foreground">{(user.followerCount || 0).toLocaleString()} followers</p>
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
              )}

              {/* Hashtags Section */}
              {displayHashtags.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {searchQuery.length === 0 ? "Trending Tags" : "Tags"}
                  </h3>
                  <div className="space-y-3">
                    {displayHashtags.slice(0, 3).map((hashtag) => (
                      <button
                        key={hashtag.tag}
                        onClick={() => {
                          onHashtagClick?.(hashtag.tag);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all group"
                        data-testid={`hashtag-result-${hashtag.tag}`}
                      >
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-orange-500/30 transition-all">
                          <Hash className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-sm group-hover:text-primary transition-colors">#{hashtag.tag}</p>
                          <p className="text-xs text-muted-foreground">{(hashtag.usageCount || 0).toLocaleString()} uses</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}

          {/* Users Tab */}
          {!isLoading && (
            <TabsContent value="users" className="mt-0 px-4 py-6">
              {displayUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No creators found</p>
              ) : (
                <div className="space-y-3">
                  {displayUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onUserClick?.(user.username);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all group"
                      data-testid={`user-${user.username}`}
                    >
                      <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                        {user.profileImageUrl && <img src={user.profileImageUrl} alt={user.username} />}
                        <AvatarFallback className="font-bold text-lg">{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-sm group-hover:text-primary transition-colors">@{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(user.followerCount || 0).toLocaleString()} followers</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-white font-semibold h-8"
                        data-testid={`button-follow-result-${user.username}`}
                      >
                        Follow
                      </Button>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Hashtags Tab */}
          {!isLoading && (
            <TabsContent value="hashtags" className="mt-0 px-4 py-6">
              {displayHashtags.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hashtags found</p>
              ) : (
                <div className="space-y-3">
                  {displayHashtags.map((hashtag) => (
                    <button
                      key={hashtag.tag}
                      onClick={() => {
                        onHashtagClick?.(hashtag.tag);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 p-4 hover-elevate rounded-lg border border-border/50 bg-card/50 transition-all group"
                      data-testid={`hashtag-${hashtag.tag}`}
                    >
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-orange-500/30 transition-all">
                        <Hash className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-sm group-hover:text-primary transition-colors">#{hashtag.tag}</p>
                        <p className="text-xs text-muted-foreground">{(hashtag.usageCount || 0).toLocaleString()} uses</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Posts Tab */}
          {!isLoading && (
            <TabsContent value="posts" className="mt-0 p-4">
              {displayPosts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No posts found</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {displayPosts.map((post) => (
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
              )}
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
