import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, UserPlus, TrendingUp, Bell } from "lucide-react";
import { useState, useEffect } from "react";
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
    text: "commented: \"This is amazing!\"",
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

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-red-500" />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "trending":
      return <TrendingUp className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "like":
      return "bg-red-500/10 border-red-500/20";
    case "comment":
      return "bg-blue-500/10 border-blue-500/20";
    case "follow":
      return "bg-green-500/10 border-green-500/20";
    case "trending":
      return "bg-orange-500/10 border-orange-500/20";
    default:
      return "bg-muted/50 border-border";
  }
};

interface NotificationsProps {
  onUserClick?: (username: string) => void;
}

export default function Notifications({ onUserClick }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get current user ID from localStorage
        let userId = localStorage.getItem("currentUserId");
        const userData = JSON.parse(localStorage.getItem("currentUserData") || "{}");
        if (userData && userData.id && userData.id !== userId) {
          userId = userData.id;
        }

        if (!userId) {
          setNotifications(mockNotifications);
          setIsLoading(false);
          return;
        }

        // Fetch notifications for current user
        const res = await fetch(`/api/notifications/${userId}`);
        if (res.ok) {
          const dbNotifications = await res.json();
          
          // Transform database notifications to UI format with enriched data
          const transformedNotifications = await Promise.all(
            (Array.isArray(dbNotifications) ? dbNotifications : []).map(async (notif: any) => {
              try {
                // Fetch the user who took the action
                const fromUser = notif.fromUserId ? await fetch(`/api/users/${notif.fromUserId}`).then(r => r.json()) : null;
                
                // Fetch post thumbnail if applicable
                let postThumbnail = undefined;
                if (notif.postId && (notif.type === 'like' || notif.type === 'comment')) {
                  const post = await fetch(`/api/posts/${notif.postId}`).then(r => r.json());
                  postThumbnail = post?.image;
                }

                return {
                  id: notif.id,
                  type: notif.type,
                  user: fromUser?.username || fromUser?.displayName || "Creator",
                  text: notif.message,
                  timeAgo: notif.createdAt ? formatTimeAgo(notif.createdAt) : "now",
                  postThumbnail,
                  isUnread: !notif.read,
                };
              } catch (e) {
                // Return basic notification if enrichment fails
                return {
                  id: notif.id,
                  type: notif.type,
                  user: "Creator",
                  text: notif.message,
                  timeAgo: "now",
                  isUnread: !notif.read,
                };
              }
            })
          );

          setNotifications(transformedNotifications.length > 0 ? transformedNotifications : mockNotifications);
        } else {
          setNotifications(mockNotifications);
        }
      } catch (error) {
        console.log("Using mock notifications:", error);
        setNotifications(mockNotifications);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return "now";
    const date = new Date(dateString);
    const now = Date.now();
    const diff = now - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (seconds < 60) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "1d ago";
    return `${days}d ago`;
  };

  return (
    <div className="pb-20" data-testid="container-notifications">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-notifications-title">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        {/* Today Section */}
        <div className="py-4 mt-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Today</h2>
        </div>

        <div className="space-y-2">
          {notifications.slice(0, 2).map((notif) => (
            <div
              key={notif.id}
              className={`group p-3 rounded-lg border-2 transition-all duration-300 hover-elevate ${
                getNotificationColor(notif.type)
              } ${notif.isUnread ? "ring-2 ring-primary/50" : ""}`}
              data-testid={`notification-${notif.id}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <button 
                  onClick={() => onUserClick?.(notif.user)}
                  className="flex-1 min-w-0 text-left hover-elevate rounded px-1 py-0.5 transition-all group"
                  data-testid={`button-notification-user-${notif.id}`}
                >
                  <p className="text-sm">
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">{notif.user}</span>
                    <span className="text-muted-foreground"> {notif.text}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.timeAgo}</p>
                </button>

                {/* Post Thumbnail or Follow Button */}
                {notif.postThumbnail && (
                  <img
                    src={notif.postThumbnail}
                    alt="Post"
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                    data-testid={`img-notification-post-${notif.id}`}
                  />
                )}
                {notif.type === "follow" && (
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90 text-white font-semibold h-8 text-xs flex-shrink-0" 
                    data-testid={`button-follow-back-${notif.id}`}
                  >
                    Follow
                  </Button>
                )}
              </div>

              {/* Unread Indicator */}
              {notif.isUnread && (
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>

        {/* Earlier Section */}
        <div className="py-4 mt-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Earlier</h2>
        </div>

        <div className="space-y-2">
          {notifications.slice(2).map((notif) => (
            <div
              key={notif.id}
              className={`group p-3 rounded-lg border-2 transition-all duration-300 hover-elevate ${
                getNotificationColor(notif.type)
              }`}
              data-testid={`notification-${notif.id}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background border-2 border-border flex items-center justify-center mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <button 
                  onClick={() => onUserClick?.(notif.user)}
                  className="flex-1 min-w-0 text-left hover-elevate rounded px-1 py-0.5 transition-all group"
                  data-testid={`button-notification-user-${notif.id}`}
                >
                  <p className="text-sm">
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">{notif.user}</span>
                    <span className="text-muted-foreground"> {notif.text}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.timeAgo}</p>
                </button>

                {/* Post Thumbnail */}
                {notif.postThumbnail && (
                  <img
                    src={notif.postThumbnail}
                    alt="Post"
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">You'll see updates here</p>
          </div>
        )}
      </div>
    </div>
  );
}
