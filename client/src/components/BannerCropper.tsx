import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BannerCropperProps {
  imageUrl: string;
  onApply: (croppedData: string) => void;
  onCancel: () => void;
}

export default function BannerCropper({ imageUrl, onApply, onCancel }: BannerCropperProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayHeight, setDisplayHeight] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

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

  const maxOffset = Math.max(0, displayHeight - BANNER_HEIGHT);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOffsetY(parseFloat(e.target.value));
  };

  const handleApply = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = BANNER_WIDTH;
    canvas.height = BANNER_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = imageDimensions.width / BANNER_WIDTH;
    const sourceY = Math.round(offsetY * scale);
    const sourceHeight = Math.round(BANNER_HEIGHT * scale);

    ctx.drawImage(
      imageRef.current,
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
    onApply(croppedData);
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

      {/* Image Preview */}
      <div className="flex-1 overflow-hidden bg-black flex items-center justify-center py-6">
        <div
          className="relative"
          style={{
            width: BANNER_WIDTH,
            height: displayHeight,
          }}
        >
          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Banner"
            className="absolute top-0 left-0 w-full object-cover"
            style={{
              height: displayHeight,
              transform: `translateY(-${offsetY}px)`,
            }}
          />

          {/* Selection Frame */}
          <div
            className="absolute left-0 right-0 border-4 border-white pointer-events-none z-10"
            style={{
              top: offsetY,
              height: BANNER_HEIGHT,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, transparent 32%, rgba(255,255,255,0.4) 32%, rgba(255,255,255,0.4) 33%, transparent 33%, transparent 66%, rgba(255,255,255,0.4) 66%, rgba(255,255,255,0.4) 67%, transparent 67%),
                  linear-gradient(0deg, transparent 32%, rgba(255,255,255,0.4) 32%, rgba(255,255,255,0.4) 33%, transparent 33%, transparent 66%, rgba(255,255,255,0.4) 66%, rgba(255,255,255,0.4) 67%, transparent 67%)
                `,
                backgroundSize: "100% 100%",
                opacity: 0.3,
              }}
            />
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="px-4 py-6 border-t border-border/50 bg-card/50 space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={maxOffset}
            value={offsetY}
            onChange={handleSliderChange}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            data-testid="slider-banner-position"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">Drag the slider up or down to select your banner</p>
      </div>
    </div>
  );
}
