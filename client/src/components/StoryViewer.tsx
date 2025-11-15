
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

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
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState("");

  const currentStory = stories[currentIndex];
  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / STORY_DURATION) * 50;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
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
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <Progress
              value={
                index < currentIndex ? 100 : index === currentIndex ? progress : 0
              }
              className="h-full"
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 ring-2 ring-white">
            <AvatarImage src={currentStory.avatar} />
            <AvatarFallback>{currentStory.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white text-sm font-semibold">{currentStory.username}</p>
            <p className="text-white/70 text-xs">{currentStory.timestamp}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
          data-testid="button-close-story"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Story content */}
      <div
        className="relative w-full h-full max-w-md"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <img
          src={currentStory.media}
          alt={`${currentStory.username}'s story`}
          className="w-full h-full object-contain"
        />

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          <button
            onClick={handlePrevious}
            className="flex-1 cursor-pointer"
            disabled={currentIndex === 0}
            data-testid="area-previous-story"
          />
          <button
            onClick={handleNext}
            className="flex-1 cursor-pointer"
            data-testid="area-next-story"
          />
        </div>

        {/* Navigation arrows (visible on hover) */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {currentIndex < stories.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 opacity-0 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* Message input */}
      <div className="absolute bottom-4 left-0 right-0 px-4 flex gap-2 max-w-md mx-auto">
        <Input
          placeholder={`Reply to ${currentStory.username}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          data-testid="input-story-message"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSendMessage}
          className="text-white hover:bg-white/10"
          data-testid="button-send-message"
        >
          <Heart className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
