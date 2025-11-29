import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePictureProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  editable?: boolean;
  onEditClick?: () => void;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-24 w-24",
};

export default function ProfilePicture({
  src,
  alt = "Profile picture",
  size = "md",
  onClick,
  className,
  editable = false,
  onEditClick,
}: ProfilePictureProps) {
  const [imageError, setImageError] = useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick?.();
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-muted/20 border border-border/20 flex-shrink-0",
        "flex items-center justify-center cursor-pointer transition-transform hover:scale-105",
        sizeMap[size],
        className
      )}
      onClick={onClick}
      data-testid={`profile-picture-${size}`}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          data-testid="img-profile-picture"
        />
      ) : (
        <User className="text-muted-foreground/60" size={size === "sm" ? 16 : size === "md" ? 24 : 48} />
      )}

      {editable && (
        <button
          onClick={handleEditClick}
          className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow-md hover-elevate active-elevate-2"
          data-testid="button-edit-profile-picture"
          title="Change profile picture"
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}
