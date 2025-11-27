import { Button } from "@/components/ui/button";
import { Copy, Share, Link2, Mail } from "lucide-react";
import { SiWhatsapp, SiX, SiFacebook, SiInstagram } from "react-icons/si";

interface ShareSheetProps {
  postUrl?: string;
  onClose: () => void;
  onShare?: (platform: string) => void;
}

export default function ShareSheet({ postUrl = "https://afrosphere.app/post/123", onClose, onShare }: ShareSheetProps) {
  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}:`, postUrl);
    onShare?.(platform);
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    console.log("Link copied!");
    onClose();
  };

  const shareOptions = [
    { id: "whatsapp", label: "WhatsApp", icon: SiWhatsapp, color: "text-green-500" },
    { id: "x", label: "X", icon: SiX, color: "text-foreground" },
    { id: "facebook", label: "Facebook", icon: SiFacebook, color: "text-blue-600" },
    { id: "instagram", label: "Instagram", icon: SiInstagram, color: "text-pink-500" },
    { id: "email", label: "Email", icon: Mail, color: "text-muted-foreground" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-2xl p-6 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
        data-testid="container-share-sheet"
      >
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
        
        <h3 className="text-lg font-semibold mb-4" data-testid="text-share-title">
          Share Post
        </h3>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className="flex flex-col items-center gap-2 p-3 hover-elevate rounded-lg"
                data-testid={`button-share-${option.id}`}
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Icon className={`h-6 w-6 ${option.color}`} />
                </div>
                <span className="text-xs text-center">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleCopyLink}
            data-testid="button-copy-link"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-testid="button-cancel-share"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
