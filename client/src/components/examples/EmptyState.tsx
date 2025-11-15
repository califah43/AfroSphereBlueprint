import EmptyState from "../EmptyState";
import { Bell, Bookmark, Users } from "lucide-react";

export default function EmptyStateExample() {
  return (
    <div className="bg-background space-y-8 p-4">
      <EmptyState
        icon={Bell}
        title="No notifications yet"
        description="When someone likes or comments on your posts, you'll see it here."
      />
      
      <EmptyState
        icon={Bookmark}
        title="No saved posts"
        description="Save posts you love to easily find them later."
        actionLabel="Start Exploring"
        onAction={() => console.log("Start exploring")}
      />
      
      <EmptyState
        icon={Users}
        title="No followers yet"
        description="Share your first post to start growing your community!"
        actionLabel="Create Post"
        onAction={() => console.log("Create post")}
      />
    </div>
  );
}
