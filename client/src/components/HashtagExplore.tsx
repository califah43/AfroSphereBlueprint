import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bookmark, BookmarkCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";

interface Hashtag {
  id: string;
  tag: string;
  usageCount: number;
}

interface HashtagExploreProps {
  userId: string;
  onHashtagClick?: (tag: string) => void;
}

export default function HashtagExplore({ userId, onHashtagClick }: HashtagExploreProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [filteredHashtags, setFilteredHashtags] = useState<Hashtag[]>([]);

  // Fetch all hashtags
  const { data: allHashtags = [], isLoading } = useQuery({
    queryKey: ['/api/hashtags/search', ''],
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch(`/api/hashtags/search?query=`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch followed hashtags
  const { data: followedHashtags = [] } = useQuery({
    queryKey: ['/api/users', userId, 'followed-hashtags'],
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/followed-hashtags`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Build following map
  useEffect(() => {
    const map: Record<string, boolean> = {};
    followedHashtags.forEach((h: Hashtag) => {
      map[h.id] = true;
    });
    setFollowingMap(map);
  }, [followedHashtags]);

  // Filter hashtags based on search
  useEffect(() => {
    let filtered = allHashtags;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = allHashtags.filter((h: Hashtag) => 
        h.tag.toLowerCase().includes(query)
      );
    }
    // Sort by usage, with followed hashtags first
    filtered.sort((a: Hashtag, b: Hashtag) => {
      const aFollowing = followingMap[a.id] ? 1 : 0;
      const bFollowing = followingMap[b.id] ? 1 : 0;
      if (aFollowing !== bFollowing) return bFollowing - aFollowing;
      return b.usageCount - a.usageCount;
    });
    setFilteredHashtags(filtered);
  }, [searchQuery, allHashtags, followingMap]);

  const handleToggleFollow = async (hashtag: Hashtag) => {
    try {
      const res = await fetch('/api/hashtags/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, hashtagId: hashtag.id }),
      });

      if (res.ok) {
        setFollowingMap(prev => ({
          ...prev,
          [hashtag.id]: !prev[hashtag.id],
        }));
      }
    } catch (error) {
      console.error('Failed to toggle hashtag follow:', error);
    }
  };

  return (
    <div className="pb-20" data-testid="container-hashtag-explore">
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 space-y-4">
          <h1 className="text-2xl font-bold">Explore Hashtags</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-hashtag-search"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredHashtags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hashtags found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHashtags.map((hashtag) => (
              <div
                key={hashtag.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover-elevate transition-all"
                data-testid={`hashtag-item-${hashtag.tag}`}
              >
                <button
                  onClick={() => onHashtagClick?.(hashtag.tag)}
                  className="flex-1 text-left"
                  data-testid={`button-view-hashtag-${hashtag.tag}`}
                >
                  <div className="font-semibold text-foreground">#{hashtag.tag}</div>
                  <div className="text-xs text-muted-foreground">
                    {hashtag.usageCount} post{hashtag.usageCount !== 1 ? 's' : ''}
                  </div>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleToggleFollow(hashtag)}
                  className="ml-2"
                  data-testid={`button-follow-hashtag-${hashtag.tag}`}
                >
                  {followingMap[hashtag.id] ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
