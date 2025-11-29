import { useState } from "react";
import { User, Camera } from "lucide-react";
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

const iconSizeMap = {
  sm: 16,
  md: 24,
  lg: 48,
};

const buttonSizeMap = {
  sm: "h-5 w-5 p-0.5",
  md: "h-6 w-6 p-1",
  lg: "h-8 w-8 p-1.5",
};

const cameraIconSizeMap = {
  sm: 12,
  md: 14,
  lg: 18,
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
        "relative rounded-full overflow-visible bg-muted/20 border border-border/20 flex-shrink-0",
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
          className="h-full w-full object-cover rounded-full"
          onError={() => setImageError(true)}
          data-testid="img-profile-picture"
        />
      ) : (
        <User className="text-muted-foreground/60" size={iconSizeMap[size]} />
      )}

      {editable && (
        <button
          onClick={handleEditClick}
          className={cn(
            "absolute -bottom-1 -right-1 bg-primary rounded-full shadow-lg hover-elevate active-elevate-2",
            "flex items-center justify-center text-white border-2 border-background",
            buttonSizeMap[size]
          )}
          data-testid="button-edit-profile-picture"
          title="Change profile picture"
        >
          <Camera size={cameraIconSizeMap[size]} className="text-white" />
        </button>
      )}
    </div>
  );
}
