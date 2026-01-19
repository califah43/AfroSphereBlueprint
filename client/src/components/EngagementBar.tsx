import { useState, useEffect } from "react";
import { Heart, MessageCircle, Eye, Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EngagementBarProps {
  postId: string;
  likes: number;
  comments: number;
  views?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

const compactNumber = (n: number): string => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

export default function EngagementBar({
  postId,
  likes,
  comments,
  views = 0,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onComment,
  onBookmark,
  onShare,
}: EngagementBarProps) {
  const [localLikes, setLocalLikes] = useState(likes);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);
  const [heartScale, setHeartScale] = useState(1);

  // Sync with parent component's prop changes (e.g., when double-tap updates isLiked)
  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalIsBookmarked(isBookmarked);
  }, [isBookmarked]);

  useEffect(() => {
    setLocalLikes(likes);
  }, [likes]);

  const handleLike = () => {
    setLocalIsLiked(!localIsLiked);
    setLocalLikes(prev => localIsLiked ? prev - 1 : prev + 1);
    
    // Trigger heart animation
    setHeartScale(1.25);
    setTimeout(() => setHeartScale(1), 300);
    
    onLike?.();
  };

  const handleBookmark = () => {
    setLocalIsBookmarked(!localIsBookmarked);
    onBookmark?.();
  };

  const [showBadgeInfo, setShowBadgeInfo] = useState<string | null>(null);

  useEffect(() => {
    const handleBadgeClick = (e: any) => {
      setShowBadgeInfo(e.detail.name);
      setTimeout(() => setShowBadgeInfo(null), 5000);
    };
    window.addEventListener('badge:click', handleBadgeClick);
    return () => window.removeEventListener('badge:click', handleBadgeClick);
  }, []);

  const getBadgeDescription = (badgeName: string) => {
    switch(badgeName.toLowerCase()) {
      case 'verified': return 'Authentic creator confirmed by AfroSphere.';
      case 'premium': return 'Supporter of the African creative economy.';
      case 'rising star': return 'Creator with rapidly growing engagement.';
      default: return 'A special recognition badge for this creator.';
    }
  };

  return (
    <div className="flex flex-col">
      {/* Badge Info Overlay */}
      {showBadgeInfo && (
        <div className="px-4 py-2 bg-primary/10 border-y border-primary/20 animate-in slide-in-from-top duration-300">
          <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Badge Info: {showBadgeInfo}</p>
          <p className="text-xs text-foreground/80 leading-snug">{getBadgeDescription(showBadgeInfo)}</p>
        </div>
      )}
      <div className="mx-3 my-3 px-3 py-2 rounded-full bg-black/40 dark:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-3" data-testid={`bar-engagement-${postId}`}>
      {/* Like Button */}
      <button
        onClick={handleLike}
        className="flex items-center gap-1.5 hover-elevate active-elevate-2 transition-all"
        data-testid={`button-like-bar-${postId}`}
        style={{
          transform: `scale(${heartScale})`,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <Heart
          className={`h-4 w-4 ${localIsLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
        />
        <span className="text-xs font-semibold text-white">{compactNumber(localLikes)}</span>
      </button>

      <div className="w-px h-4 bg-white/20"></div>

      {/* Comment Button */}
      <button
        onClick={onComment}
        className="flex items-center gap-1.5 hover-elevate active-elevate-2 transition-all"
        data-testid={`button-comment-bar-${postId}`}
      >
        <MessageCircle className="h-4 w-4 text-white" />
        <span className="text-xs font-semibold text-white">{compactNumber(comments)}</span>
      </button>

      <div className="flex-1"></div>

      {/* View Count (Subtle) */}
      {views > 0 && (
        <>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-white/60" />
            <span className="text-xs text-white/60">{compactNumber(views)}</span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={handleBookmark}
        className="hover-elevate active-elevate-2 transition-all"
        data-testid={`button-save-bar-${postId}`}
      >
        <Bookmark
          className={`h-4 w-4 ${localIsBookmarked ? 'fill-primary text-primary' : 'text-white'}`}
        />
      </button>

      {/* Share Button */}
      <button
        onClick={onShare}
        className="hover-elevate active-elevate-2 transition-all"
        data-testid={`button-share-bar-${postId}`}
      >
        <Share2 className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}
