import { useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageViewer({ src, alt = "Image", isOpen, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 1));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="modal-image-viewer"
    >
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 text-white hover:bg-white/20"
          onClick={onClose}
          data-testid="button-close-image-viewer"
        >
          <X size={24} />
        </Button>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            data-testid="button-zoom-out"
          >
            <ZoomOut size={20} />
          </Button>
          <div className="flex items-center justify-center min-w-12 bg-white/10 rounded-lg px-2">
            <span className="text-white text-sm font-medium">{Math.round(scale * 100)}%</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            data-testid="button-zoom-in"
          >
            <ZoomIn size={20} />
          </Button>
        </div>

        {/* Image Container with Zoom & Pan */}
        <div className="flex items-center justify-center overflow-hidden rounded-lg bg-black/40 max-h-96">
          <div
            className="transition-transform cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center",
            }}
          >
            <img
              src={src}
              alt={alt}
              className="max-h-96 max-w-md object-contain"
              data-testid="img-fullscreen-viewer"
            />
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-white/60 text-xs mt-3">Click outside to close</p>
      </div>
    </div>
  );
}
