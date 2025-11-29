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

function BadgeIcon({ icon, name }: { icon: string; name: string }) {
  // Extract SVG content and viewBox
  const viewBoxMatch = icon.match(/viewBox="([^"]*)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";
  
  // Extract everything between <svg> and </svg> without 's' flag
  const startIdx = icon.indexOf('>');
  const endIdx = icon.lastIndexOf('<');
  const content = startIdx !== -1 && endIdx > startIdx ? icon.substring(startIdx + 1, endIdx) : "";

  return (
    <div className="w-4 h-4" title={name}>
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
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
          const badgeList = (Array.isArray(data) ? data : (data.badges || [])).map((b: any) => ({
            userId,
            badgeId: b.id,
            name: b.name,
            icon: b.iconSvg || b.icon,
            color: b.color || "#000",
          }));
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
