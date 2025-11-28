import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BannerCropperProps {
  imageUrl: string;
  onApply: (croppedData: string, cropPosition: { x: number; y: number }) => void;
  onCancel: () => void;
}

export default function BannerCropper({ imageUrl, onApply, onCancel }: BannerCropperProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayHeight, setDisplayHeight] = useState(0);
  const cropperRef = useRef<HTMLDivElement>(null);

  const BANNER_HEIGHT = 96;
  const BANNER_WIDTH = 430;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      const aspectRatio = img.naturalHeight / img.naturalWidth;
      const displayH = BANNER_WIDTH * aspectRatio;
      setDisplayHeight(displayH);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || displayHeight === 0) return;

      const delta = e.clientY - startY;
      const maxOffset = Math.max(0, displayHeight - BANNER_HEIGHT);
      let newOffset = offsetY - delta;
      newOffset = Math.max(0, Math.min(newOffset, maxOffset));

      setOffsetY(newOffset);
      setStartY(e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offsetY, startY, displayHeight]);

  const handleApply = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = BANNER_WIDTH;
      canvas.height = BANNER_HEIGHT;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scale = imageDimensions.width / BANNER_WIDTH;
      const sourceY = Math.round(offsetY * scale);
      const sourceHeight = Math.round(BANNER_HEIGHT * scale);

      ctx.drawImage(
        img,
        0,
        sourceY,
        imageDimensions.width,
        sourceHeight,
        0,
        0,
        BANNER_WIDTH,
        BANNER_HEIGHT
      );

      const croppedData = canvas.toDataURL("image/jpeg", 0.9);
      onApply(croppedData, { x: 0, y: offsetY });
    };
    img.src = imageUrl;
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
          data-testid="button-apply-banner"
        >
          Apply
        </Button>
      </div>

      {/* Cropper Area */}
      <div
        ref={cropperRef}
        className="flex-1 overflow-hidden bg-black flex items-center justify-center"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="relative select-none"
          style={{
            width: BANNER_WIDTH,
            height: displayHeight,
            onMouseDown: handleMouseDown,
          }}
          onMouseDown={handleMouseDown}
          data-testid="banner-cropper-container"
        >
          {/* Image with offset */}
          <img
            src={imageUrl}
            alt="Banner"
            className="absolute top-0 left-0 w-full object-cover"
            style={{
              height: displayHeight,
              transform: `translateY(-${offsetY}px)`,
              userSelect: "none",
            }}
            data-testid="img-banner-preview"
          />

          {/* Selection Frame Overlay */}
          <div
            className="absolute left-0 right-0 border-4 border-white pointer-events-none"
            style={{
              top: offsetY,
              height: BANNER_HEIGHT,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
            }}
            data-testid="banner-selection-frame"
          >
            {/* Grid lines */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, transparent 32%, rgba(255,255,255,0.3) 32%, rgba(255,255,255,0.3) 33%, transparent 33%, transparent 66%, rgba(255,255,255,0.3) 66%, rgba(255,255,255,0.3) 67%, transparent 67%),
                  linear-gradient(0deg, transparent 32%, rgba(255,255,255,0.3) 32%, rgba(255,255,255,0.3) 33%, transparent 33%, transparent 66%, rgba(255,255,255,0.3) 66%, rgba(255,255,255,0.3) 67%, transparent 67%)
                `,
                backgroundSize: "100% 100%",
                opacity: 0.3,
              }}
            />
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
