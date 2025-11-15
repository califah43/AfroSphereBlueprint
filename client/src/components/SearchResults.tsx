import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, X, Hash, TrendingUp } from "lucide-react";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";
import artImage from "@assets/generated_images/African_art_post_example_49c114b5.png";
import musicImage from "@assets/generated_images/African_music_creator_post_902db11f.png";

interface SearchResultsProps {
  onClose: () => void;
  onHashtagClick?: (hashtag: string) => void;
  onUserClick?: (username: string) => void;
}

const mockUsers = [
  { username: "adikeafrica", name: "Adike Africa", followers: "1.2K" },
  { username: "kojoart", name: "Kojo Art", followers: "8.9K" },
  { username: "amaarabeats", name: "Amaara Beats", followers: "15.2K" },
];

const mockHashtags = [
  { tag: "AfricanFashion", posts: "12.5K" },
  { tag: "AfroBeats", posts: "45.2K" },
  { tag: "AfricanArt", posts: "8.9K" },
  { tag: "AnkaraPrint", posts: "6.3K" },
];

const mockPosts = [
  { id: "1", image: fashionImage },
  { id: "2", image: artImage },
  { id: "3", image: musicImage },
  { id: "4", image: fashionImage },
  { id: "5", image: artImage },
  { id: "6", image: musicImage },
];

export default function SearchResults({ onClose, onHashtagClick, onUserClick }: SearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-search">
            <X className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search AfroSphere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted"
              autoFocus
              data-testid="input-search-query"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="sticky top-14 bg-background border-b border-border px-4 pt-2">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="hashtags" data-testid="tab-hashtags">Tags</TabsTrigger>
            <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="all" className="mt-0 p-4 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Users</h3>
              <div className="space-y-2">
                {mockUsers.slice(0, 3).map((user) => (
                  <button
                    key={user.username}
                    onClick={() => onUserClick?.(user.username)}
                    className="w-full flex items-center gap-3 p-2 hover-elevate rounded-lg"
                    data-testid={`user-result-${user.username}`}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                    </div>
                    <Button size="sm" variant="outline" data-testid={`button-follow-${user.username}`}>
                      Follow
                    </Button>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Hashtags</h3>
              <div className="space-y-2">
                {mockHashtags.slice(0, 3).map((hashtag) => (
                  <button
                    key={hashtag.tag}
                    onClick={() => onHashtagClick?.(hashtag.tag)}
                    className="w-full flex items-center gap-3 p-2 hover-elevate rounded-lg"
                    data-testid={`hashtag-result-${hashtag.tag}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Hash className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">#{hashtag.tag}</p>
                      <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-0 p-4">
            <div className="space-y-2">
              {mockUsers.map((user) => (
                <button
                  key={user.username}
                  onClick={() => onUserClick?.(user.username)}
                  className="w-full flex items-center gap-3 p-2 hover-elevate rounded-lg"
                  data-testid={`user-${user.username}`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hashtags" className="mt-0 p-4">
            <div className="space-y-2">
              {mockHashtags.map((hashtag) => (
                <button
                  key={hashtag.tag}
                  onClick={() => onHashtagClick?.(hashtag.tag)}
                  className="w-full flex items-center gap-3 p-3 hover-elevate rounded-lg"
                  data-testid={`hashtag-${hashtag.tag}`}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Hash className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">#{hashtag.tag}</p>
                    <p className="text-sm text-muted-foreground">{hashtag.posts} posts</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-0 p-4">
            <div className="grid grid-cols-3 gap-1">
              {mockPosts.map((post) => (
                <button
                  key={post.id}
                  className="aspect-square hover-elevate overflow-hidden rounded"
                  data-testid={`search-post-${post.id}`}
                >
                  <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
