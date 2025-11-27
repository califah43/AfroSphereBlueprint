import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfilePictureModalProps {
  imageUrl: string;
  displayName: string;
  onClose: () => void;
}

export default function ProfilePictureModal({ imageUrl, displayName, onClose }: ProfilePictureModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-lg overflow-hidden max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{displayName}'s Profile Picture</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover-elevate"
            data-testid="button-close-picture"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={displayName}
            className="w-full h-full object-cover"
            data-testid="img-profile-picture-full"
          />
        </div>
      </div>
    </div>
  );
}
