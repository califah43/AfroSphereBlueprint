import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoryViewerProps {
  stories: Array<{
    id: string;
    username: string;
    avatar?: string;
    media: string;
    timestamp: string;
  }>;
  initialStoryIndex?: number;
  onClose: () => void;
}

export default function StoryViewer({
  stories,
  initialStoryIndex = 0,
  onClose,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progressBars, setProgressBars] = useState<number[]>(
    stories.map((_, i) => (i < initialStoryIndex ? 100 : i === initialStoryIndex ? 0 : 0))
  );
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [startX, setStartX] = useState(0);

  const currentStory = stories[currentIndex];
  const STORY_DURATION = 5000;

  // Auto-advance story
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgressBars((prev) => {
        const updated = [...prev];
        if (updated[currentIndex] >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            updated[currentIndex + 1] = 0;
          } else {
            onClose();
          }
        } else {
          updated[currentIndex] = Math.min(100, updated[currentIndex] + (100 / STORY_DURATION) * 50);
        }
        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgressBars((prev) => {
        const updated = [...prev];
        updated[currentIndex + 1] = 0;
        return updated;
      });
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgressBars((prev) => {
        const updated = [...prev];
        updated[currentIndex - 1] = 0;
        return updated;
      });
    }
  };

  // Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    setIsPaused(false);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Send message to", currentStory.username, ":", message);
      setMessage("");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      data-testid="story-viewer"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars - Snapchat style */}
      <div className="absolute top-2 left-0 right-0 z-20 flex gap-1 px-2 max-w-[430px] mx-auto">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progressBars[index] || 0}%` }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-20 px-4 flex items-center justify-between max-w-[430px] mx-auto">
        <div className="flex items-center gap-2">
          <Avatar className="w-9 h-9 ring-2 ring-white">
            <AvatarFallback className="text-xs">{currentStory.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white text-sm font-bold">@{currentStory.username}</p>
            <p className="text-white/70 text-xs">{currentStory.timestamp}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full"
          data-testid="button-close-story"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Story image - Full screen */}
      <div
        className="relative w-full h-full max-w-[430px] max-h-screen bg-black flex items-center justify-center cursor-pointer"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        <img
          src={currentStory.media}
          alt={`${currentStory.username}'s story`}
          className="w-full h-full object-cover"
        />

        {/* Tap zones for navigation */}
        <div className="absolute inset-0 flex pointer-events-none">
          <button
            onClick={handlePrevious}
            className="flex-1 cursor-pointer pointer-events-auto"
            disabled={currentIndex === 0}
            data-testid="area-previous-story"
          />
          <button
            onClick={handleNext}
            className="flex-1 cursor-pointer pointer-events-auto"
            data-testid="area-next-story"
          />
        </div>
      </div>

      {/* Message input - Snapchat style */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 max-w-[430px] mx-auto">
        <div className="flex gap-2 items-center">
          <Input
            placeholder={`Message @${currentStory.username}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/50 rounded-full text-sm"
            data-testid="input-story-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
            className="bg-primary hover:bg-primary/90 rounded-full px-4"
            data-testid="button-send-message"
          >
            ↑
          </Button>
        </div>
      </div>
    </div>
  );
}
