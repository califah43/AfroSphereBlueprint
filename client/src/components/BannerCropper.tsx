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

  const BANNER_HEIGHT = 96;
  const BANNER_WIDTH = 430;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const maxOffset = Math.max(0, imageDimensions.height - BANNER_HEIGHT);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOffset = parseFloat(e.target.value);
    setOffsetY(newOffset);

    // Live preview in canvas
    if (canvasRef.current && imageDimensions.width > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        const scale = imageDimensions.width / BANNER_WIDTH;
        const sourceY = Math.round(newOffset * scale);
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
      img.src = imageUrl;
    }
  };

  const handleApply = () => {
    if (!canvasRef.current) return;
    const croppedData = canvasRef.current.toDataURL("image/jpeg", 0.9);
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

      {/* Canvas Preview */}
      <div className="flex-1 overflow-hidden bg-black flex items-center justify-center py-6">
        <canvas
          ref={canvasRef}
          width={BANNER_WIDTH}
          height={BANNER_HEIGHT}
          className="border-4 border-white"
          style={{ boxShadow: "0 0 20px rgba(0, 0, 0, 0.8)" }}
        />
      </div>

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
