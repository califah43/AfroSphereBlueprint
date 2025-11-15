import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

interface Story {
  id: string;
  username: string;
  avatar?: string;
  hasStory: boolean;
  isViewed?: boolean;
}

interface StoriesProps {
  stories: Story[];
  onAddStory?: () => void;
  onViewStory?: (storyId: string) => void;
}

export default function Stories({ stories, onAddStory, onViewStory }: StoriesProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 px-4 scrollbar-hide" data-testid="container-stories">
      <button
        onClick={onAddStory}
        className="flex flex-col items-center gap-2 flex-shrink-0"
        data-testid="button-add-story"
      >
        <div className="relative">
          <Avatar className="w-16 h-16 ring-2 ring-muted">
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
            <Plus className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
        <p className="text-xs font-medium truncate w-16 text-center">Your Story</p>
      </button>

      {stories.map((story) => (
        <button
          key={story.id}
          onClick={() => onViewStory?.(story.id)}
          className="flex flex-col items-center gap-2 flex-shrink-0"
          data-testid={`story-${story.id}`}
        >
          <div
            className={`rounded-full p-0.5 ${
              story.hasStory && !story.isViewed
                ? "bg-gradient-to-tr from-primary via-orange-500 to-pink-500"
                : story.isViewed
                ? "bg-muted"
                : "bg-transparent"
            }`}
          >
            <Avatar className="w-16 h-16 ring-2 ring-background">
              <AvatarImage src={story.avatar} />
              <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <p className="text-xs font-medium truncate w-16 text-center">{story.username}</p>
        </button>
      ))}
    </div>
  );
}
