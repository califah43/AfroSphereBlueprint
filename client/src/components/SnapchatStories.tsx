import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface Story {
  id: string;
  username: string;
  avatar?: string;
  isViewed?: boolean;
}

interface SnapchatStoriesProps {
  stories: Story[];
  onAddStory?: () => void;
  onViewStory?: (storyId: string) => void;
}

export default function SnapchatStories({ stories, onAddStory, onViewStory }: SnapchatStoriesProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide" data-testid="container-stories">
      {/* Add Story Button */}
      <button
        onClick={onAddStory}
        className="flex flex-col items-center gap-2 flex-shrink-0 hover-elevate"
        data-testid="button-add-story"
      >
        <div className="relative">
          <Avatar className="w-14 h-14 ring-2 ring-border">
            <AvatarFallback className="text-sm font-bold">+</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 ring-2 ring-background">
            <Plus className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
        <p className="text-xs font-medium truncate w-14 text-center">Your Story</p>
      </button>

      {/* Stories */}
      {stories.map((story) => (
        <button
          key={story.id}
          onClick={() => onViewStory?.(story.id)}
          className="flex flex-col items-center gap-2 flex-shrink-0 hover-elevate transition-transform"
          data-testid={`story-${story.id}`}
        >
          {/* Snapchat-style gradient ring for unviewed, gray for viewed */}
          <div
            className={`rounded-full p-0.5 ${
              !story.isViewed
                ? "bg-gradient-to-tr from-primary via-orange-400 to-pink-500"
                : "bg-muted"
            }`}
          >
            <Avatar className="w-14 h-14 ring-2 ring-background">
              <AvatarFallback className="text-sm font-semibold">
                {story.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="text-xs font-medium truncate w-14 text-center">{story.username}</p>
        </button>
      ))}
    </div>
  );
}
