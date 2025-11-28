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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const BANNER_HEIGHT = 96;
  const BANNER_WIDTH = 430;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      // Draw initial preview
      drawPreview(img, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const maxOffset = Math.max(0, imageDimensions.height - BANNER_HEIGHT);

  const drawPreview = (img: HTMLImageElement, offset: number) => {
    if (!canvasRef.current || imageDimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = imageDimensions.width / BANNER_WIDTH;
    const sourceY = Math.round(offset * scale);
    const sourceHeight = Math.round(BANNER_HEIGHT * scale);

    ctx.clearRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);
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
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOffset = parseFloat(e.target.value);
    setOffsetY(newOffset);

    if (imageRef.current) {
      drawPreview(imageRef.current, newOffset);
    }
  };

  const handleApply = () => {
    if (!canvasRef.current) return;
    const croppedData = canvasRef.current.toDataURL("image/jpeg", 0.9);
    onApply(croppedData);
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      drawPreview(img, offsetY);
    };
    img.src = imageUrl;
  }, [imageUrl, offsetY]);

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

      {/* Preview with Transparency Overlay */}
      <div className="flex-1 overflow-hidden bg-black flex items-center justify-center py-6 relative">
        {/* Full Image with Transparency Overlay */}
        <div className="relative" style={{ width: BANNER_WIDTH }}>
          <img
            src={imageUrl}
            alt="Full"
            className="w-full"
            style={{
              height: imageDimensions.height > 0 ? (BANNER_WIDTH * imageDimensions.height) / imageDimensions.width : "auto",
            }}
          />

          {/* Top Transparent Overlay */}
          <div
            className="absolute left-0 right-0 bg-black/70"
            style={{
              top: 0,
              height: offsetY,
            }}
          />

          {/* Bottom Transparent Overlay */}
          <div
            className="absolute left-0 right-0 bg-black/70"
            style={{
              top: offsetY + BANNER_HEIGHT,
              height: imageDimensions.height > 0 ? (BANNER_WIDTH * imageDimensions.height) / imageDimensions.width - offsetY - BANNER_HEIGHT : 0,
            }}
          />

          {/* Selection Frame */}
          <div
            className="absolute left-0 right-0 border-4 border-white pointer-events-none z-20"
            style={{
              top: offsetY,
              height: BANNER_HEIGHT,
            }}
          >
            {/* Grid Lines */}
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

      {/* Canvas Preview (Hidden but for reference) */}
      <canvas ref={canvasRef} width={BANNER_WIDTH} height={BANNER_HEIGHT} style={{ display: "none" }} />

      {/* Slider Controls */}
      <div className="px-4 py-6 border-t border-border/50 bg-card/50 space-y-3">
        <input
          type="range"
          min="0"
          max={maxOffset}
          value={offsetY}
          onChange={handleSliderChange}
          className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          data-testid="slider-banner-position"
          style={{ outline: "none" }}
        />
        <p className="text-xs text-muted-foreground text-center">Drag slider to adjust banner crop</p>
      </div>
    </div>
  );
}
