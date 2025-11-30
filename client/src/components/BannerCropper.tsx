import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface BannerCropperProps {
  imageUrl: string;
  onApply: (croppedData: string) => void;
  onCancel: () => void;
}

export default function BannerCropper({ imageUrl, onApply, onCancel }: BannerCropperProps) {
  const [offsetY, setOffsetY] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const BANNER_HEIGHT = 150;
  const BANNER_WIDTH = 450;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientY);
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientY);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    const delta = e.clientY - dragStart;
    setDragOffset(delta);
    const newOffset = Math.max(0, Math.min(offsetY - delta, maxOffset));
    drawPreview(imageRef.current, newOffset);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageRef.current) return;
    const delta = e.touches[0].clientY - dragStart;
    setDragOffset(delta);
    const newOffset = Math.max(0, Math.min(offsetY - delta, maxOffset));
    drawPreview(imageRef.current, newOffset);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      const newOffset = Math.max(0, Math.min(offsetY - dragOffset, maxOffset));
      setOffsetY(newOffset);
      setDragOffset(0);
    }
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      const newOffset = Math.max(0, Math.min(offsetY - dragOffset, maxOffset));
      setOffsetY(newOffset);
      setDragOffset(0);
    }
    setIsDragging(false);
  };

  const adjustOffset = (delta: number) => {
    const newOffset = Math.max(0, Math.min(offsetY + delta, maxOffset));
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
      if (imageRef) {
        (imageRef as any).current = img;
      }
      drawPreview(img, offsetY);
    };
    img.src = imageUrl;
  }, [imageUrl, offsetY]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove as any);
      document.addEventListener("touchmove", handleTouchMove as any);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove as any);
        document.removeEventListener("touchmove", handleTouchMove as any);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, dragStart, offsetY, dragOffset, maxOffset, imageRef]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/30 backdrop-blur-sm bg-background/95">
        <button 
          onClick={onCancel} 
          className="text-muted-foreground hover:text-foreground font-medium text-sm transition-colors"
          data-testid="button-cancel-banner"
        >
          Cancel
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold tracking-tight">Adjust Cover Photo</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Drag to reposition</p>
        </div>
        <Button
          onClick={handleApply}
          className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9 px-5 rounded-lg transition-all hover-elevate"
          data-testid="button-apply-banner"
        >
          Done
        </Button>
      </div>

      {/* Premium Editor Area */}
      <div 
        ref={previewContainerRef}
        className="flex-1 overflow-hidden bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-6 relative"
      >
        {/* Decorative gradient background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Main Preview Container */}
        <div className="relative z-10">
          {/* Glass Container */}
          <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10 shadow-2xl">
            {/* Full Image with Premium Overlays */}
            <div 
              ref={previewContainerRef}
              className="relative overflow-hidden rounded-xl cursor-grab active:cursor-grabbing transition-all"
              style={{ width: BANNER_WIDTH }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <img
                src={imageUrl}
                alt="Cover"
                className="w-full select-none"
                style={{
                  height: imageDimensions.height > 0 ? (BANNER_WIDTH * imageDimensions.height) / imageDimensions.width : "auto",
                  pointerEvents: "none",
                }}
                draggable={false}
              />

              {/* Top Overlay with Gradient */}
              <div
                className="absolute left-0 right-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none transition-all"
                style={{
                  top: 0,
                  height: offsetY - dragOffset,
                }}
              />

              {/* Bottom Overlay with Gradient */}
              <div
                className="absolute left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none transition-all"
                style={{
                  top: (offsetY - dragOffset) + BANNER_HEIGHT,
                  height: imageDimensions.height > 0 ? (BANNER_WIDTH * imageDimensions.height) / imageDimensions.width - (offsetY - dragOffset) - BANNER_HEIGHT : 0,
                }}
              />

              {/* Premium Selection Frame with Glow */}
              <div
                className="absolute left-0 right-0 pointer-events-none z-20 transition-all duration-75"
                style={{
                  top: offsetY - dragOffset,
                  height: BANNER_HEIGHT,
                }}
              >
                {/* Outer Glow */}
                <div className="absolute inset-0 border-2 border-primary/40 rounded-sm blur-sm" />
                
                {/* Inner Frame */}
                <div className="absolute inset-0 border-2 border-primary rounded-sm">
                  {/* Grid Lines */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(90deg, transparent 32%, rgba(255, 140, 0, 0.3) 32%, rgba(255, 140, 0, 0.3) 33%, transparent 33%, transparent 66%, rgba(255, 140, 0, 0.3) 66%, rgba(255, 140, 0, 0.3) 67%, transparent 67%),
                        linear-gradient(0deg, transparent 32%, rgba(255, 140, 0, 0.3) 32%, rgba(255, 140, 0, 0.3) 33%, transparent 33%, transparent 66%, rgba(255, 140, 0, 0.3) 66%, rgba(255, 140, 0, 0.3) 67%, transparent 67%)
                      `,
                      backgroundSize: "100% 100%",
                    }}
                  />
                </div>

                {/* Corner Brackets */}
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
              </div>
            </div>
          </div>

          {/* Drag Hint */}
          {offsetY > 5 && offsetY < maxOffset - 5 && (
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 text-center pointer-events-none">
              <div className="inline-flex items-center gap-1 text-xs text-white/60 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <ChevronUp className="w-3 h-3" />
                <span>Drag</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Preview (Hidden) */}
      <canvas ref={canvasRef} width={BANNER_WIDTH} height={BANNER_HEIGHT} style={{ display: "none" }} />

      {/* Premium Controls */}
      <div className="px-4 py-4 border-t border-border/30 bg-card/30 backdrop-blur-sm space-y-4">
        {/* Arrow Buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => adjustOffset(-20)}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-primary/30 hover:bg-primary/10"
            data-testid="button-adjust-up"
            disabled={offsetY <= 0}
          >
            <ChevronUp className="h-5 w-5 text-primary" />
          </Button>
          
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground">
              Position: {Math.round((offsetY / maxOffset) * 100)}%
            </p>
          </div>
          
          <Button
            onClick={() => adjustOffset(20)}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-primary/30 hover:bg-primary/10"
            data-testid="button-adjust-down"
            disabled={offsetY >= maxOffset}
          >
            <ChevronDown className="h-5 w-5 text-primary" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">Drag the image or use buttons to adjust</p>
      </div>
    </div>
  );
}
