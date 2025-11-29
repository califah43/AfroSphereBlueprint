import { useState, useEffect } from "react";

interface BadgeIcon {
  userId: string;
  badgeId: string;
  name: string;
  icon: string;
  color: string;
}

interface BadgeDisplayProps {
  userId?: string;
  className?: string;
  preloadedBadges?: any[];
}

// Module-level cache for badge requests to prevent duplicate fetches
const badgeCache = new Map<string, Promise<BadgeIcon[]>>();

function BadgeIcon({ icon, name }: { icon: string; name: string }) {
  const dataUri = `data:image/svg+xml;base64,${btoa(icon)}`;
  
  return (
    <img 
      src={dataUri}
      alt={name}
      title={name}
      className="w-4 h-4 inline-block"
    />
  );
}

export default function BadgeDisplay({ userId, className = "", preloadedBadges }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<BadgeIcon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Use preloaded badges if provided
    if (preloadedBadges && preloadedBadges.length > 0) {
      const badgeList = preloadedBadges.map((b: any) => ({
        userId: userId || "",
        badgeId: b.id,
        name: b.name,
        icon: b.iconSvg || b.icon,
        color: b.color || "#000",
      }));
      setBadges(badgeList);
      return;
    }
    
    // Otherwise fetch badges with caching
    const fetchBadges = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // Check cache first - if request is in progress, wait for it
        if (badgeCache.has(userId)) {
          const cachedPromise = badgeCache.get(userId)!;
          const badgeList = await cachedPromise;
          setBadges(badgeList);
          return;
        }
        
        // Create fetch promise and cache it
        const fetchPromise = (async () => {
          const res = await fetch(`/api/badges/user/${userId}`);
          if (res.ok) {
            const data = await res.json();
            return (Array.isArray(data) ? data : (data.badges || [])).map((b: any) => ({
              userId,
              badgeId: b.id,
              name: b.name,
              icon: b.iconSvg || b.icon,
              color: b.color || "#000",
            }));
          }
          return [];
        })();
        
        badgeCache.set(userId, fetchPromise);
        const badgeList = await fetchPromise;
        setBadges(badgeList);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [userId, preloadedBadges]);

  if (badges.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`} data-testid={`badge-container-${userId}`}>
      {badges.map((badge) => (
        <div
          key={badge.badgeId}
          className="inline-flex items-center justify-center flex-shrink-0"
          data-testid={`badge-${badge.name}-${userId}`}
        >
          <BadgeIcon icon={badge.icon} name={badge.name} />
        </div>
      ))}
    </div>
  );
}
