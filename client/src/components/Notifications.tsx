import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import fashionImage from "@assets/generated_images/African_fashion_post_example_3f594112.png";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "trending";
  user: string;
  text: string;
  timeAgo: string;
  postThumbnail?: string;
  isUnread?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    user: "zara_style",
    text: "liked your post",
    timeAgo: "2m ago",
    postThumbnail: fashionImage,
    isUnread: true,
  },
  {
    id: "2",
    type: "follow",
    user: "kwame_creative",
    text: "started following you",
    timeAgo: "1h ago",
    isUnread: true,
  },
  {
    id: "3",
    type: "comment",
    user: "amara_fashion",
    text: "commented: \"This is amazing! 🔥\"",
    timeAgo: "3h ago",
    postThumbnail: fashionImage,
  },
  {
    id: "4",
    type: "trending",
    user: "afrosphere",
    text: "Your post is trending in Fashion",
    timeAgo: "5h ago",
    postThumbnail: fashionImage,
  },
  {
    id: "5",
    type: "like",
    user: "kojoart",
    text: "liked your post",
    timeAgo: "1d ago",
    postThumbnail: fashionImage,
  },
];

export default function Notifications() {
  return (
    <div className="pb-20" data-testid="container-notifications">
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold" data-testid="text-notifications-title">
            Notifications
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Today</h2>
        </div>

        <div>
          {mockNotifications.slice(0, 2).map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-3 flex items-center gap-3 hover-elevate ${
                notif.isUnread ? "bg-muted/30" : ""
              }`}
              data-testid={`notification-${notif.id}`}
            >
              <Avatar className="w-11 h-11">
                <AvatarFallback>{notif.user[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{notif.user}</span>{" "}
                  <span className="text-muted-foreground">{notif.text}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{notif.timeAgo}</p>
              </div>
              {notif.postThumbnail && (
                <img
                  src={notif.postThumbnail}
                  alt="Post"
                  className="w-12 h-12 object-cover rounded"
                  data-testid={`img-notification-post-${notif.id}`}
                />
              )}
              {notif.type === "follow" && (
                <Button size="sm" variant="default" data-testid={`button-follow-back-${notif.id}`}>
                  Follow
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="px-4 py-3 mt-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Earlier</h2>
        </div>

        <div>
          {mockNotifications.slice(2).map((notif) => (
            <div
              key={notif.id}
              className="px-4 py-3 flex items-center gap-3 hover-elevate"
              data-testid={`notification-${notif.id}`}
            >
              <Avatar className="w-11 h-11">
                <AvatarFallback>{notif.user[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{notif.user}</span>{" "}
                  <span className="text-muted-foreground">{notif.text}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{notif.timeAgo}</p>
              </div>
              {notif.postThumbnail && (
                <img
                  src={notif.postThumbnail}
                  alt="Post"
                  className="w-12 h-12 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
