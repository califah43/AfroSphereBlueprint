import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderCropperProps {
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
}

export default function HeaderCropper({ onClose, onCropComplete }: HeaderCropperProps) {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [scale, setScale] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, dist: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const FRAME_WIDTH = 330;
  const FRAME_HEIGHT = 120;
  const MAX_SCALE = 4;
  const MIN_SCALE = 1;

  useEffect(() => {
    if (!selectedImage) {
      fileInputRef.current?.click();
    }
  }, [selectedImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - positionX, y: e.clientY - positionY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPositionX(e.clientX - dragStart.x);
    setPositionY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setTouchStart({ x: e.touches[0].clientX - positionX, y: e.touches[0].clientY - positionY, dist: 0 });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStart({ x: positionX, y: positionY, dist });
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPositionX(e.touches[0].clientX - touchStart.x);
      setPositionY(e.touches[0].clientY - touchStart.y);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (dist / (touchStart.dist || 1))));
      setScale(newScale);
      setTouchStart({ ...touchStart, dist });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * delta));
    setScale(newScale);
  };

  const handleCrop = async () => {
    if (!imageRef.current) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = FRAME_WIDTH;
      canvas.height = FRAME_HEIGHT;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast({ description: "Failed to create canvas", variant: "destructive" });
        return;
      }

      const containerRect = containerRef.current?.getBoundingClientRect();
      const frameRect = document.querySelector("[data-crop-frame]")?.getBoundingClientRect();

      if (!containerRect || !frameRect) {
        toast({ description: "Failed to calculate crop area", variant: "destructive" });
        return;
      }

      // Calculate the offset of the frame relative to the container
      const frameX = frameRect.left - containerRect.left;
      const frameY = frameRect.top - containerRect.top;

      // Draw image onto canvas with proper positioning
      ctx.drawImage(
        imageRef.current,
        -frameX - positionX,
        -frameY - positionY,
        imageRef.current.naturalWidth * scale,
        imageRef.current.naturalHeight * scale
      );

      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      onCropComplete(croppedDataUrl);
      onClose();
    } catch (error) {
      console.error("Crop error:", error);
      toast({ description: "Failed to crop image", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-header-file"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <h2 className="text-lg font-bold text-foreground" data-testid="text-crop-header">
          Crop Header Image
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-cropper"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Crop Container */}
      {selectedImage && (
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-hidden relative bg-black cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
          onWheel={handleWheel}
          data-testid="div-crop-container"
        >
          {/* Image */}
          <img
            ref={imageRef}
            src={selectedImage}
            alt="Crop"
            className="absolute select-none pointer-events-none"
            style={{
              transform: `translate(${positionX}px, ${positionY}px) scale(${scale})`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
            data-testid="img-crop-preview"
          />

          {/* Crop Frame */}
          <div
            className="absolute border-2 border-white/80 rounded-2xl pointer-events-none"
            style={{
              width: `${FRAME_WIDTH}px`,
              height: `${FRAME_HEIGHT}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            }}
            data-crop-frame
            data-testid="div-crop-frame"
          />

          {/* Instructions */}
          <div className="absolute top-8 left-4 right-4 text-center text-white/60 text-sm pointer-events-none">
            <p className="mb-2" data-testid="text-drag-instruction">Drag to move</p>
            <p data-testid="text-zoom-instruction">Scroll or pinch to zoom (1x - 4x)</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 p-4 border-t border-border/30">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
          data-testid="button-cancel-crop"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            setSelectedImage("");
            setScale(1);
            setPositionX(0);
            setPositionY(0);
          }}
          className="flex-1"
          variant="outline"
          data-testid="button-change-image"
        >
          Change Image
        </Button>
        <Button
          onClick={handleCrop}
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={!selectedImage}
          data-testid="button-apply-crop"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
