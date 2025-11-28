import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BannerCropperProps {
  imageUrl: string;
  onApply: (croppedData: string, cropPosition: { x: number; y: number }) => void;
  onCancel: () => void;
}

export default function BannerCropper({ imageUrl, onApply, onCancel }: BannerCropperProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const BANNER_HEIGHT = 96; // h-24 = 96px
  const BANNER_WIDTH = 430; // mobile width

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const delta = e.clientY - startY;
    const maxOffset = Math.max(0, imageDimensions.height - BANNER_HEIGHT);
    let newOffset = offsetY - delta;
    newOffset = Math.max(0, Math.min(newOffset, maxOffset));

    setOffsetY(newOffset);
    setStartY(e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApply = () => {
    if (!containerRef.current || !imageRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = BANNER_WIDTH;
    canvas.height = BANNER_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate the source rectangle for cropping
    const scaleX = imageDimensions.width / BANNER_WIDTH;
    const scaleY = imageDimensions.height / imageRef.current.clientHeight;

    const sourceX = 0;
    const sourceY = offsetY * scaleY;
    const sourceWidth = imageDimensions.width;
    const sourceHeight = BANNER_HEIGHT * scaleY;

    ctx.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      BANNER_WIDTH,
      BANNER_HEIGHT
    );

    const croppedData = canvas.toDataURL("image/jpeg", 0.9);
    onApply(croppedData, { x: 0, y: offsetY });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button onClick={onCancel} className="text-foreground font-semibold text-sm">
          Cancel
        </button>
        <h2 className="text-sm font-black tracking-tight">Select Banner</h2>
        <Button
          onClick={handleApply}
          className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white font-bold text-xs h-8 px-4 rounded-lg"
        >
          Apply
        </Button>
      </div>

      {/* Cropper Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-black flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative" style={{ width: BANNER_WIDTH }}>
          {/* Full Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Banner to crop"
            className="w-full object-cover"
            style={{
              transform: `translateY(-${offsetY}px)`,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />

          {/* Banner Selection Frame */}
          <div
            className="absolute left-0 right-0 border-4 border-white pointer-events-none z-10"
            style={{
              top: 0,
              height: BANNER_HEIGHT,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, transparent 32%, rgba(255,255,255,0.3) 32%, rgba(255,255,255,0.3) 33%, transparent 33%, transparent 66%, rgba(255,255,255,0.3) 66%, rgba(255,255,255,0.3) 67%, transparent 67%),
                    linear-gradient(0deg, transparent 32%, rgba(255,255,255,0.3) 32%, rgba(255,255,255,0.3) 33%, transparent 33%, transparent 66%, rgba(255,255,255,0.3) 66%, rgba(255,255,255,0.3) 67%, transparent 67%)
                  `,
                  backgroundSize: "100% 100%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 border-t border-border/50 bg-card/50 text-center">
        <p className="text-xs text-muted-foreground">Drag to adjust the banner crop area</p>
      </div>
    </div>
  );
}
