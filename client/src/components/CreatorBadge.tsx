import { Badge } from "@/components/ui/badge";
import { Crown, Palette, Music, Sparkles, Shirt } from "lucide-react";

export type BadgeType = "early-creator" | "top-artist" | "fashion-vanguard" | "music-star" | "cultural-icon";

interface CreatorBadgeProps {
  type: BadgeType;
  size?: "sm" | "md" | "lg";
}

const badgeConfig = {
  "early-creator": {
    label: "Early Creator",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
  "top-artist": {
    label: "Top Artist",
    icon: Palette,
    gradient: "from-orange-500 to-red-500",
  },
  "fashion-vanguard": {
    label: "Fashion Vanguard",
    icon: Shirt,
    gradient: "from-pink-500 to-purple-500",
  },
  "music-star": {
    label: "Music Star",
    icon: Music,
    gradient: "from-green-500 to-teal-500",
  },
  "cultural-icon": {
    label: "Cultural Icon",
    icon: Crown,
    gradient: "from-yellow-500 to-orange-500",
  },
};

export default function CreatorBadge({ type, size = "md" }: CreatorBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge
      className={`bg-gradient-to-r ${config.gradient} text-white border-0 ${sizeClasses[size]} flex items-center gap-1.5 font-semibold`}
      data-testid={`badge-${type}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </Badge>
  );
}
