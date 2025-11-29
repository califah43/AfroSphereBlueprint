import { useState, useEffect } from "react";

interface BadgeIcon {
  userId: string;
  badgeId: string;
  name: string;
  icon: string;
  color: string;
}

interface BadgeDisplayProps {
  userId: string;
  className?: string;
}

export default function BadgeDisplay({ userId, className = "" }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<BadgeIcon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const res = await fetch(`/api/badges/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched badges for user", userId, ":", data);
          // data is already the badges array
          const badgeList = (Array.isArray(data) ? data : (data.badges || [])).map((b: any) => ({
            userId,
            badgeId: b.id,
            name: b.name,
            icon: b.iconSvg || b.icon,
            color: b.color || "#000",
          }));
          console.log("Processed badge list:", badgeList);
          setBadges(badgeList);
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  if (badges.length === 0) return null;

  return (
    <div className={`flex items-center gap-0.5 ${className}`} data-testid={`badge-container-${userId}`}>
      {badges.map((badge) => (
        <div
          key={badge.badgeId}
          className="w-4 h-4 flex items-center justify-center flex-shrink-0"
          title={badge.name}
          data-testid={`badge-${badge.name}-${userId}`}
          dangerouslySetInnerHTML={{ __html: badge.icon }}
        />
      ))}
    </div>
  );
}
